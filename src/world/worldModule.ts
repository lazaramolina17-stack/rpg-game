import { Module } from '../core/module.js';
import { World, Entity, Component, ComponentType, System } from '../core/ecs.js';

export interface PositionComponent extends Component {
  x: number;
  y: number;
  z: number;
}

export interface VelocityComponent extends Component {
  vx: number;
  vy: number;
  vz: number;
}

export interface RegionComponent extends Component {
  regionId: string;
  chunkX: number;
  chunkY: number;
}

export interface TimeComponent extends Component {
  timeOfDay: number; // 0-24
  day: number;
  season: number;
  timeScale: number;
}

export interface WeatherComponent extends Component {
  type: 'clear' | 'rain' | 'snow' | 'storm' | 'fog';
  intensity: number;
  duration: number;
}

export const ComponentTypes = {
  Position: 'Position',
  Velocity: 'Velocity',
  Region: 'Region',
  Time: 'Time',
  Weather: 'Weather'
} as const;

export class TimeSystem implements System {
  world!: World;
  enabled = true;
  priority = 100;

  update(dt: number): void {
    const timeEntities = this.world.getEntitiesWith(ComponentTypes.Time);
    for (const entity of timeEntities) {
      const time = this.world.getComponent<TimeComponent>(entity, ComponentTypes.Time);
      if (time) {
        time.timeOfDay += dt * time.timeScale * 0.1;
        if (time.timeOfDay >= 24) {
          time.timeOfDay -= 24;
          time.day++;
          if (time.day % 90 === 0) time.season = (time.season + 1) % 4;
        }
      }
    }
  }
}

export class WeatherSystem implements System {
  world!: World;
  enabled = true;
  priority = 90;

  update(dt: number): void {
    const weatherEntities = this.world.getEntitiesWith(ComponentTypes.Weather);
    for (const entity of weatherEntities) {
      const weather = this.world.getComponent<WeatherComponent>(entity, ComponentTypes.Weather);
      if (weather) {
        weather.duration -= dt;
        if (weather.duration <= 0) {
          this.changeWeather(entity, weather);
        }
      }
    }
  }

  private changeWeather(entity: Entity, weather: WeatherComponent): void {
    const types: WeatherComponent['type'][] = ['clear', 'rain', 'snow', 'storm', 'fog'];
    weather.type = types[Math.floor(Math.random() * types.length)];
    weather.intensity = Math.random();
    weather.duration = 300 + Math.random() * 1800; // 5-35 minutes
  }
}

export class WorldModule implements Module {
  name = 'world';
  version = '1.0.0';
  dependencies = ['core'];

  private timeSystem = new TimeSystem();
  private weatherSystem = new WeatherSystem();

  async initialize(ctx: any): Promise<void> {
    ctx.world.addSystem(this.timeSystem);
    ctx.world.addSystem(this.weatherSystem);
    
    // Create global time entity
    const timeEntity = ctx.world.createEntity();
    ctx.world.addComponent(timeEntity, {
      entity: timeEntity,
      timeOfDay: 12,
      day: 1,
      season: 0,
      timeScale: 1.0
    });

    // Create global weather entity
    const weatherEntity = ctx.world.createEntity();
    ctx.world.addComponent(weatherEntity, {
      entity: weatherEntity,
      type: 'clear',
      intensity: 0,
      duration: 300
    });

    ctx.logger.info('World module initialized');
  }

  async shutdown(): Promise<void> {
    // Cleanup
  }
}