# DECISION LOG

## Registro de Decisiones Arquitectónicas y Técnicas

---

### D-001: Three.js vía CDN en vez de npm

- **Fecha:** 2026-07-25
- **Contexto:** npm es extremadamente lento en Termux Android
- **Decisión:** Usar importmap con CDN (jsdelivr)
- **Consecuencia:** Bundle más pequeño, pero dependencia de red para Three.js

### D-002: Canvas 2D overlay para HUD en vez de Three.js sprites

- **Fecha:** 2026-07-25
- **Contexto:** El HUD (barras, inventario, minimap) es más fácil de dibujar en 2D
- **Decisión:** Mantener canvas 2D separado superpuesto al WebGL canvas
- **Consecuencia:** UI más simple de implementar, pero dos capas de render

### D-003: Cámara ortográfica → perspectiva en primera persona

- **Fecha:** 2026-07-25
- **Contexto:** Solicitud de cámara en primera persona
- **Decisión:** Cambiar de OrthographicCamera a PerspectiveCamera con PointerLockControls
- **Consecuencia:** Movimiento debe ser relativo a la dirección de la cámara

### D-004: Touch camera look en lado derecho

- **Fecha:** 2026-07-25
- **Contexto:** Necesario para control táctil en Android
- **Decisión:** Usar document-level touch listeners con passive:false + touch-action:none
- **Consecuencia:** Los botones del lado derecho no interfieren con camera look

### D-005: isTouchDevice() hardcodeado a true

- **Fecha:** 2026-07-25
- **Contexto:** Los controles táctiles deben ser visibles también en desktop para testing
- **Decisión:** `return true` en lugar de detección real de dispositivo táctil
- **Consecuencia:** Botones táctiles siempre visibles, pero no interfieren en desktop

### D-006: Modelos 3D procedimentales sin texturas

- **Fecha:** 2026-07-25
- **Contexto:** Zero assets externos, mismo principio que los sprites 2D
- **Decisión:** Usar geometrías básicas de Three.js (Box, Sphere, Cylinder, Cone)
- **Consecuencia:** Estilo low-poly consistente, sin necesidad de texturas
