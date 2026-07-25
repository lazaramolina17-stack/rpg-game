import { Module } from '../core/module.js';
import { World, Entity, Component, System } from '../core/ecs.js';

export interface CurrencyComponent extends Component {
  currencies: Map<string, number>;
  primaryCurrency: string;
}

export interface WalletComponent extends Component {
  owner: Entity;
  currencies: Map<string, number>;
  transactionHistory: Transaction[];
}

export interface Transaction {
  id: string;
  timestamp: number;
  type: 'earn' | 'spend' | 'trade' | 'tax' | 'reward' | 'fine';
  currency: string;
  amount: number;
  balance: number;
  source: string;
  target?: Entity;
  metadata: Record<string, any>;
}

export interface ShopComponent extends Component {
  shopId: string;
  name: string;
  type: ShopType;
  inventory: ShopItem[];
  buyMultiplier: number;
  sellMultiplier: number;
  currency: string;
  restockInterval: number;
  lastRestock: number;
  reputationRequired: number;
  factionId?: string;
}

export type ShopType = 'general' | 'weapon' | 'armor' | 'alchemy' | 'magic' | 'jewelry' | 'food' | 'trade' | 'blackmarket';

export interface ShopItem {
  itemId: string;
  stock: number;
  maxStock: number;
  priceOverride?: number;
  restockTime: number;
  requiresReputation: number;
}

export interface MarketComponent extends Component {
  regionId: string;
  listings: MarketListing[];
  taxRate: number;
  listingsFee: number;
  maxListingsPerPlayer: number;
}

export interface MarketListing {
  id: string;
  seller: Entity;
  itemId: string;
  count: number;
  pricePerUnit: number;
  currency: string;
  createdAt: number;
  expiresAt: number;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
}

export interface EconomyConfig {
  baseCurrency: string;
  inflationRate: number;
  taxRates: Map<string, number>;
  maxTransactionValue: number;
  marketTax: number;
  tradeTax: number;
}

export interface PriceComponent extends Component {
  basePrice: number;
  currentPrice: number;
  demand: number;
  supply: number;
  elasticity: number;
  lastUpdate: number;
}

export class EconomyModule implements Module {
  name = 'economy';
  version = '1.0.0';
  dependencies = ['core', 'inventory'];

  async initialize(ctx: any): Promise<void> {
    ctx.world.addSystem(new CurrencySystem());
    ctx.world.addSystem(new ShopSystem());
    ctx.world.addSystem(new MarketSystem());
    ctx.world.addSystem(new PriceSystem());
    ctx.logger.info('Economy module initialized');
  }

  async shutdown(): Promise<void> {}
}

export class CurrencySystem implements System {
  world!: World;
  enabled = true;
  priority = 60;

  private baseCurrency = 'gold';

  update(dt: number): void {}

  addCurrency(entity: Entity, currency: string, amount: number, source: string, metadata: Record<string, any> = {}): boolean {
    const wallet = this.world.getComponent<WalletComponent>(entity, 'WalletComponent');
    if (!wallet) return false;

    const current = wallet.currencies.get(currency) ?? 0;
    wallet.currencies.set(currency, current + amount);

    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: amount >= 0 ? 'earn' : 'spend',
      currency,
      amount: Math.abs(amount),
      balance: current + amount,
      source,
      metadata
    };

    wallet.transactionHistory.push(transaction);
    if (wallet.transactionHistory.length > 1000) wallet.transactionHistory.shift();

    this.world.emit('currency:changed', { entity, currency, amount, balance: current + amount });
    return true;
  }

  removeCurrency(entity: Entity, currency: string, amount: number, source: string): boolean {
    return this.addCurrency(entity, currency, -amount, source);
  }

  getBalance(entity: Entity, currency: string): number {
    const wallet = this.world.getComponent<WalletComponent>(entity, 'WalletComponent');
    if (!wallet) return 0;
    return wallet.currencies.get(currency) ?? 0;
  }

  transferCurrency(from: Entity, to: Entity, currency: string, amount: number, reason: string): boolean {
    if (this.getBalance(from, currency) < amount) return false;
    if (!this.removeCurrency(from, currency, amount, `transfer_to_${to}:${reason}`)) return false;
    if (!this.addCurrency(to, currency, amount, `transfer_from_${from}:${reason}`)) {
      this.addCurrency(from, currency, amount, `refund:${reason}`);
      return false;
    }
    this.world.emit('currency:transfer', { from, to, currency, amount, reason });
    return true;
  }

  canAfford(entity: Entity, currency: string, amount: number): boolean {
    return this.getBalance(entity, currency) >= amount;
  }
}

export class ShopSystem implements System {
  world!: World;
  enabled = true;
  priority = 50;

  update(dt: number): void {
    const shops = this.world.query({ all: ['ShopComponent'] });
    for (const entity of shops) {
      this.processRestock(entity);
    }
  }

  buyItem(buyer: Entity, shopEntity: Entity, itemId: string, count: number = 1): PurchaseResult {
    const shop = this.world.getComponent<ShopComponent>(shopEntity, 'ShopComponent');
    const wallet = this.world.getComponent<WalletComponent>(buyer, 'WalletComponent');
    if (!shop || !wallet) return { success: false, reason: 'Missing components' };

    const shopItem = shop.inventory.find(i => i.itemId === itemId);
    if (!shopItem) return { success: false, reason: 'Item not found' };
    if (shopItem.stock < count) return { success: false, reason: 'Insufficient stock' };
    if (shopItem.requiresReputation > (this.getReputation(buyer, shop.factionId) ?? 0)) {
      return { success: false, reason: 'Insufficient reputation' };
    }

    const price = this.calculatePrice(shopItem, shop, count);
    if (!this.canAfford(buyer, shop.currency, price)) {
      return { success: false, reason: 'Insufficient funds' };
    }

    const removed = this.removeCurrency(buyer, shop.currency, price, `shop_purchase:${shop.shopId}`);
    if (!removed) return { success: false, reason: 'Payment failed' };

    shopItem.stock -= count;
    this.addItemToInventory(buyer, itemId, count);

    this.world.emit('shop:purchase', { buyer, shop: shopEntity, itemId, count, price });
    return { success: true, price, itemsReceived: count };
  }

  sellItem(seller: Entity, shopEntity: Entity, itemId: string, count: number = 1): SaleResult {
    const shop = this.world.getComponent<ShopComponent>(shopEntity, 'ShopComponent');
    const inventory = this.world.getComponent<InventoryComponent>(seller, 'InventoryComponent');
    if (!shop || !inventory) return { success: false, reason: 'Missing components' };

    const hasItem = this.getItemCount(seller, itemId);
    if (hasItem < count) return { success: false, reason: 'Insufficient items' };

    const basePrice = this.getItemBasePrice(itemId);
    const price = Math.floor(basePrice * shop.sellMultiplier * count);

    if (!this.removeItem(seller, itemId, count)) return { success: false, reason: 'Item removal failed' };
    this.addCurrency(seller, shop.currency, price, `shop_sale:${shop.shopId}`);

    const existing = shop.inventory.find(i => i.itemId === itemId);
    if (existing) existing.stock = Math.min(existing.maxStock, existing.stock + count);
    else shop.inventory.push({ itemId, stock: count, maxStock: 999, restockTime: 0 });

    this.world.emit('shop:sale', { seller, shop: shopEntity, itemId, count, price });
    return { success: true, price, itemsSold: count };
  }

  private processRestock(entity: Entity): void {
    const shop = this.world.getComponent<ShopComponent>(entity, 'ShopComponent');
    if (!shop) return;

    const now = Date.now();
    if (now - shop.lastRestock < shop.restockInterval) return;

    for (const item of shop.inventory) {
      if (item.stock < item.maxStock) {
        const restockAmount = Math.min(item.maxStock - item.stock, Math.floor(item.maxStock * 0.1));
        item.stock += restockAmount;
      }
    }
    shop.lastRestock = now;
  }

  private calculatePrice(shopItem: ShopItem, shop: ShopComponent, count: number): number {
    const basePrice = shopItem.priceOverride ?? this.getItemBasePrice(shopItem.itemId);
    return Math.floor(basePrice * shop.buyMultiplier * count);
  }

  private getItemBasePrice(itemId: string): number {
    return 10;
  }

  private getReputation(entity: Entity, factionId?: string): number | undefined {
    if (!factionId) return undefined;
    const faction = this.world.getComponent(entity, 'FactionComponent');
    return faction?.reputation;
  }

  private canAfford(entity: Entity, currency: string, amount: number): boolean {
    const wallet = this.world.getComponent<WalletComponent>(entity, 'WalletComponent');
    return (wallet?.currencies.get(currency) ?? 0) >= amount;
  }

  private addCurrency(entity: Entity, currency: string, amount: number, source: string): boolean {
    return this.world.getSystem(CurrencySystem)?.addCurrency(entity, currency, amount, source) ?? false;
  }

  private removeCurrency(entity: Entity, currency: string, amount: number, source: string): boolean {
    return this.world.getSystem(CurrencySystem)?.removeCurrency(entity, currency, amount, source) ?? false;
  }

  private addItemToInventory(entity: Entity, itemId: string, count: number): void {
    // Create item entity and add to inventory
  }

  private removeItem(entity: Entity, itemId: string, count: number): boolean {
    return this.world.getSystem(InventorySystem)?.removeItem(entity, null, count) ?? false;
  }

  private getItemCount(entity: Entity, itemId: string): number {
    return this.world.getSystem(InventorySystem)?.getItemCount(entity, itemId) ?? 0;
  }
}

export class MarketSystem implements System {
  world!: World;
  enabled = true;
  priority = 40;

  update(dt: number): void {
    const markets = this.world.query({ all: ['MarketComponent'] });
    for (const entity of markets) {
      this.processExpiredListings(entity);
    }
  }

  createListing(seller: Entity, marketEntity: Entity, itemId: string, count: number, pricePerUnit: number, currency: string, duration: number = 86400000): MarketListing | null {
    const market = this.world.getComponent<MarketComponent>(marketEntity, 'MarketComponent');
    const inventory = this.world.getComponent<InventoryComponent>(seller, 'InventoryComponent');
    if (!market || !inventory) return null;

    const playerListings = market.listings.filter(l => l.seller === seller && l.status === 'active').length;
    if (playerListings >= market.maxListingsPerPlayer) return null;

    if (!this.removeItem(seller, itemId, count)) return null;

    const listing: MarketListing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      seller,
      itemId,
      count,
      pricePerUnit,
      currency,
      createdAt: Date.now(),
      expiresAt: Date.now() + duration,
      status: 'active'
    };

    market.listings.push(listing);
    this.world.emit('market:listing_created', { listing, market: marketEntity });
    return listing;
  }

  purchaseListing(buyer: Entity, marketEntity: Entity, listingId: string, count: number): PurchaseResult {
    const market = this.world.getComponent<MarketComponent>(marketEntity, 'MarketComponent');
    if (!market) return { success: false, reason: 'Market not found' };

    const listing = market.listings.find(l => l.id === listingId);
    if (!listing || listing.status !== 'active') return { success: false, reason: 'Listing not available' };
    if (listing.seller === buyer) return { success: false, reason: 'Cannot buy own listing' };
    if (count > listing.count) return { success: false, reason: 'Insufficient quantity' };

    const totalPrice = listing.pricePerUnit * count;
    if (!this.canAfford(buyer, listing.currency, totalPrice)) return { success: false, reason: 'Insufficient funds' };

    const tax = Math.floor(totalPrice * market.taxRate);
    const sellerAmount = totalPrice - tax;

    this.removeCurrency(buyer, listing.currency, totalPrice, `market_purchase:${listingId}`);
    this.addCurrency(listing.seller, listing.currency, sellerAmount, `market_sale:${listingId}`);

    this.addItemToInventory(buyer, listing.itemId, count);

    listing.count -= count;
    if (listing.count === 0) listing.status = 'sold';

    this.world.emit('market:purchase', { buyer, seller: listing.seller, listing, count, price: totalPrice, tax });
    return { success: true, price: totalPrice, itemsReceived: count };
  }

  private processExpiredListings(entity: Entity): void {
    const market = this.world.getComponent<MarketComponent>(entity, 'MarketComponent');
    if (!market) return;

    const now = Date.now();
    for (const listing of market.listings) {
      if (listing.status === 'active' && listing.expiresAt <= now) {
        listing.status = 'expired';
        this.addItemToInventory(listing.seller, listing.itemId, listing.count);
        this.world.emit('market:listing_expired', { listing, market: entity });
      }
    }
  }

  private canAfford(entity: Entity, currency: string, amount: number): boolean {
    return this.world.getSystem(CurrencySystem)?.canAfford(entity, currency, amount) ?? false;
  }

  private removeCurrency(entity: Entity, currency: string, amount: number, source: string): boolean {
    return this.world.getSystem(CurrencySystem)?.removeCurrency(entity, currency, amount, source) ?? false;
  }

  private addCurrency(entity: Entity, currency: string, amount: number, source: string): boolean {
    return this.world.getSystem(CurrencySystem)?.addCurrency(entity, currency, amount, source) ?? false;
  }

  private removeItem(entity: Entity, itemId: string, count: number): boolean {
    return this.world.getSystem(InventorySystem)?.removeItem(entity, null, count) ?? false;
  }

  private addItemToInventory(entity: Entity, itemId: string, count: number): void {}
}

export class PriceSystem implements System {
  world!: World;
  enabled = true;
  priority = 30;

  update(dt: number): void {
    const prices = this.world.query({ all: ['PriceComponent'] });
    for (const entity of prices) {
      this.updatePrice(entity, dt);
    }
  }

  private updatePrice(entity: Entity, dt: number): void {
    const price = this.world.getComponent<PriceComponent>(entity, 'PriceComponent');
    if (!price) return;

    const targetPrice = price.basePrice * (1 + (price.demand - price.supply) * price.elasticity);
    price.currentPrice += (targetPrice - price.currentPrice) * 0.01;
    price.lastUpdate = Date.now();
  }
}

export interface PurchaseResult {
  success: boolean;
  reason?: string;
  price?: number;
  itemsReceived?: number;
}

export interface SaleResult {
  success: boolean;
  reason?: string;
  price?: number;
  itemsSold?: number;
}