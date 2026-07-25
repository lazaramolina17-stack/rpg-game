# Project State

## Phase: Foundation (Week 1-2)
- [ ] Core module system
- [ ] Event bus
- [ ] Configuration system
- [ ] Logging/debug console
- [ ] Content registry
- [ ] Basic ECS framework

## Phase: Core Systems (Week 3-6)
- [ ] World system (regions, streaming, time)
- [ ] NPC system (routines, memory, factions)
- [ ] RPG systems (stats, skills, progression)
- [ ] Combat system (strategic, tactical)
- [ ] Inventory/Equipment
- [ ] Economy/Trading
- [ ] Quest system

## Phase: Persistence & Network (Week 7-10)
- [ ] Save system (versioned, migration)
- [ ] Database layer
- [ ] Server architecture
- [ ] Networking (authoritative)
- [ ] Security (anti-cheat, validation)

## Phase: Content & Tools (Week 11-14)
- [ ] Data editors
- [ ] Level editor
- [ ] Quest editor
- [ ] Mod API
- [ ] Asset pipeline

## Phase: Polish & Scale (Week 15+)
- [ ] Performance optimization
- [ ] Audio/Art integration
- [ ] Testing automation
- [ ] Documentation
- [ ] Live ops preparation

## Current Sprint: Foundation
Active: Core module system, Event bus, Config
Next: Content registry, ECS framework

## Decisions Log
- [2024-01-15] TypeScript + Rust hybrid architecture
- [2024-01-15] ECS for gameplay, traditional OOP for engine
- [2024-01-15] SQLite for local, PostgreSQL for server
- [2024-01-15] Lua for modding, TypeScript for core