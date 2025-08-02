/**
 * Invisible filters available via:
 *  - filter-[url('#glow-outline')]
 */
export default function SvgFilters() {
  return (
    <>
      <svg width="0" height="0" area-hidden="true" className="absolute">
        <filter id="glow-outline">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="3"
            in="SourceGraphic"
            floodColor="#eaeaea"
            result="blur"
            floodOpacity="1"
          ></feDropShadow>
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 32 -1"
            in="blur"
            result="outline"
          ></feColorMatrix>
          <feFlood floodColor="#eaeaea" floodOpacity="1" result="offsetColor"></feFlood>
          <feComposite
            in="offsetColor"
            in2="outline"
            operator="in"
            result="offsetBlur"
          ></feComposite>
          <feBlend in="SourceGraphic" in2="offsetBlur"></feBlend>
        </filter>
      </svg>
    </>
  );
}
