## Reglas de profesionalización visual

Codex debe revisar toda la interfaz aplicando estas reglas:

1. Usar una jerarquía visual clara:
   - Título principal visible.
   - Subtítulo explicativo.
   - Acción primaria destacada.
   - Acciones secundarias menos prominentes.

2. Mejorar consistencia de espaciado:
   - Usar padding uniforme en cards.
   - Separar secciones con espacio suficiente.
   - Evitar pantallas saturadas.

3. Mejorar estados interactivos:
   - Todos los botones deben tener hover, active, focus-visible y disabled.
   - Las filas de tablas deben tener hover suave.
   - Los elementos clicables deben comunicar que son interactivos.

4. Usar transiciones moderadas:
   - transition-colors
   - transition-shadow
   - transition-transform
   - duration-150 o duration-200
   - No usar animaciones exageradas.

5. Usar sombras sutiles:
   - Cards principales: shadow-sm o shadow-xs.
   - Modales: shadow-xl.
   - Evitar sombras fuertes o estilo comercial.

6. Usar confirmaciones:
   - AlertDialog para acciones críticas.
   - Dialog para formularios o información secundaria.
   - Sonner/Toast para confirmaciones no críticas.

7. Usar estados del sistema:
   - Loading con Skeleton.
   - EmptyState cuando no haya datos.
   - ErrorState cuando falle una acción.
   - Success toast cuando se complete una acción.

8. Mantener diseño institucional:
   - No usar colores neón.
   - No usar gradientes exagerados.
   - No usar iconografía informal.
   - Priorizar claridad, confianza y trazabilidad.

9. Accesibilidad:
   - Usar focus-visible.
   - Mantener buen contraste.
   - No depender solo del color para estados.
   - Usar textos descriptivos en botones.

## Paleta de colores

### Colores principales

```css
--color-navy: #08204A;
--color-primary: #0B57B7;
--color-primary-light: #EAF5FF;
--color-background: #F7F9FC;
--color-card: #FFFFFF;
--color-text: #172033;
--color-muted: #667085;
--color-border: #D9E1EC;