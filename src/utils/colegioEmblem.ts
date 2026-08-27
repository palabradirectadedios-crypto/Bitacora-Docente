/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Generate a high-resolution crisp base64 SVG / PNG image of the official Colegio Militar Almirante Colón Header
export function getColegioHeaderImageBase64(): string {
  // SVG of the complete header with official crest and typography
  const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 240" width="1000" height="240">
    <defs>
      <!-- Gradients -->
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCE570"/>
        <stop offset="50%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#996515"/>
      </linearGradient>
      <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4A90E2"/>
        <stop offset="60%" stop-color="#1E5799"/>
        <stop offset="100%" stop-color="#0E2F5E"/>
      </linearGradient>
      <linearGradient id="flagYellow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFDE00"/>
        <stop offset="100%" stop-color="#E5C500"/>
      </linearGradient>
      <linearGradient id="flagBlue" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#003893"/>
        <stop offset="100%" stop-color="#002166"/>
      </linearGradient>
      <linearGradient id="flagRed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#CE1126"/>
        <stop offset="100%" stop-color="#9E0C1C"/>
      </linearGradient>
      <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B5A2B"/>
        <stop offset="100%" stop-color="#4A2F13"/>
      </linearGradient>
      <!-- Shadow filter -->
      <filter id="subtleDrop" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.25"/>
      </filter>
    </defs>

    <!-- LEFT SIDE: OFFICIAL CREST / SHIELD OF COLEGIO MILITAR ALMIRANTE COLON -->
    <g transform="translate(100, 100)" filter="url(#subtleDrop)">
      <!-- Crossed Military Rifles in the Background -->
      <!-- Rifle 1 (Diagonal /) -->
      <g transform="rotate(45)">
        <rect x="-3" y="-82" width="6" height="164" rx="2" fill="url(#woodGrad)" stroke="#221100" stroke-width="0.8"/>
        <!-- Barrel and Bayonet -->
        <rect x="-1.5" y="-92" width="3" height="14" fill="#C0C0C0" stroke="#333" stroke-width="0.6"/>
        <polygon points="-1,-92 1,-92 0,-102" fill="#E8E8E8" stroke="#555" stroke-width="0.5"/>
        <!-- Stock Butt -->
        <rect x="-4" y="70" width="8" height="16" rx="1.5" fill="#3A1E0B"/>
      </g>
      <!-- Rifle 2 (Diagonal \) -->
      <g transform="rotate(-45)">
        <rect x="-3" y="-82" width="6" height="164" rx="2" fill="url(#woodGrad)" stroke="#221100" stroke-width="0.8"/>
        <!-- Barrel and Bayonet -->
        <rect x="-1.5" y="-92" width="3" height="14" fill="#C0C0C0" stroke="#333" stroke-width="0.6"/>
        <polygon points="-1,-92 1,-92 0,-102" fill="#E8E8E8" stroke="#555" stroke-width="0.5"/>
        <!-- Stock Butt -->
        <rect x="-4" y="70" width="8" height="16" rx="1.5" fill="#3A1E0B"/>
      </g>

      <!-- Laurel Leaves Wreath (Green) -->
      <g fill="#2E7D32" stroke="#1B5E20" stroke-width="0.5">
        <!-- Left Laurel branch -->
        <ellipse cx="-52" cy="10" rx="6" ry="12" transform="rotate(-25, -52, 10)"/>
        <ellipse cx="-56" cy="-15" rx="5.5" ry="11" transform="rotate(-10, -56, -15)"/>
        <ellipse cx="-52" cy="-38" rx="5" ry="10" transform="rotate(10, -52, -38)"/>
        <ellipse cx="-40" cy="-58" rx="4.5" ry="9" transform="rotate(30, -40, -58)"/>
        <!-- Right Laurel branch -->
        <ellipse cx="52" cy="10" rx="6" ry="12" transform="rotate(25, 52, 10)"/>
        <ellipse cx="56" cy="-15" rx="5.5" ry="11" transform="rotate(10, 56, -15)"/>
        <ellipse cx="52" cy="-38" rx="5" ry="10" transform="rotate(-10, 52, -38)"/>
        <ellipse cx="40" cy="-58" rx="4.5" ry="9" transform="rotate(-30, 40, -58)"/>
      </g>

      <!-- Top Anchor Behind Ring -->
      <g stroke="url(#goldGrad)" stroke-width="3.5" fill="none" stroke-linecap="round">
        <circle cx="0" cy="-66" r="6.5" fill="none" stroke-width="2.5"/>
        <line x1="0" y1="-60" x2="0" y2="-40"/>
        <line x1="-12" y1="-53" x2="12" y2="-53"/>
      </g>

      <!-- Top Golden Crown / Mural Crest -->
      <path d="M-22,-44 L-20,-64 L-10,-55 L0,-67 L10,-55 L20,-64 L22,-44 Z" fill="url(#goldGrad)" stroke="#7A4E08" stroke-width="1"/>
      <circle cx="-20" cy="-64" r="2" fill="#FFEAA7"/>
      <circle cx="0" cy="-67" r="2.5" fill="#FFEAA7"/>
      <circle cx="20" cy="-64" r="2" fill="#FFEAA7"/>

      <!-- Circular Lifebuoy Frame (White and Gold) -->
      <circle cx="0" cy="0" r="54" fill="#FFFFFF" stroke="url(#goldGrad)" stroke-width="4"/>
      <circle cx="0" cy="0" r="41" fill="#FFFFFF" stroke="url(#goldGrad)" stroke-width="1.8"/>

      <!-- Central Ocean Disc -->
      <circle cx="0" cy="0" r="40" fill="url(#seaGrad)"/>

      <!-- Ocean waves in central disc -->
      <path d="M-40,16 Q-25,10 -10,16 Q5,22 20,16 Q32,10 40,16 L40,40 L-40,40 Z" fill="#0C2548" opacity="0.6"/>
      <path d="M-38,24 Q-20,18 0,24 Q20,30 38,24 L38,40 L-38,40 Z" fill="#071830" opacity="0.8"/>

      <!-- Sailing Galleon / Santa María Caravel -->
      <g transform="translate(0, 4)">
        <!-- Ship Hull (Wood gold/brown) -->
        <path d="M-20,14 C-16,22 16,22 22,14 C18,9 -16,9 -20,14 Z" fill="url(#woodGrad)" stroke="#2D1500" stroke-width="0.8"/>
        <!-- Ship Main Masts -->
        <line x1="0" y1="12" x2="0" y2="-18" stroke="#3A1E0B" stroke-width="1.8"/>
        <line x1="-11" y1="12" x2="-11" y2="-12" stroke="#3A1E0B" stroke-width="1.4"/>
        <line x1="12" y1="12" x2="12" y2="-10" stroke="#3A1E0B" stroke-width="1.4"/>
        <!-- Sails (White/Golden canvas with red cross) -->
        <!-- Main sail -->
        <path d="M-9,-3 C0,-8 9,-8 9,-3 C8,8 -8,8 -9,-3 Z" fill="#FFFDF0" stroke="#8C734B" stroke-width="0.6"/>
        <!-- Red Cross on main sail -->
        <path d="M-2,-2 L2,-2 L2,4 L-2,4 Z M-6,0 L6,0 L6,2 L-6,2 Z" fill="#C0392B"/>
        <!-- Topsail -->
        <path d="M-7,-16 C0,-19 7,-19 7,-16 C6,-7 -6,-7 -7,-16 Z" fill="#FFFDF0" stroke="#8C734B" stroke-width="0.5"/>
        <!-- Fore sail (left) -->
        <path d="M-17,-2 C-11,-5 -7,-5 -7,-2 C-8,6 -16,6 -17,-2 Z" fill="#FFFDF0" stroke="#8C734B" stroke-width="0.5"/>
        <!-- Mizzen sail (right triangular) -->
        <polygon points="12,-8 22,7 12,7" fill="#FFFDF0" stroke="#8C734B" stroke-width="0.5"/>
        <!-- Colombian Pennant Flag on Top of main mast -->
        <polygon points="0,-18 7,-16 0,-14" fill="#FFDE00"/>
      </g>

      <!-- Inscribed Text on the White Lifebuoy Ring (Arc emulation) -->
      <path id="topArc" d="M -46,0 A 46,46 0 0,1 46,0" fill="none"/>
      <path id="bottomArc" d="M -46,0 A 46,46 0 0,0 46,0" fill="none"/>
      
      <text font-family="'Arial Black', Arial, sans-serif" font-size="6.8" font-weight="900" fill="#1A202C" letter-spacing="1">
        <textPath href="#topArc" startOffset="50%" text-anchor="middle">
          COLEGIO MILITAR ALMIRANTE COLON
        </textPath>
      </text>

      <text font-family="'Arial Black', Arial, sans-serif" font-size="6.5" font-weight="900" fill="#1A202C" letter-spacing="1.2">
        <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
          CERETE - CORDOBA
        </textPath>
      </text>

      <!-- Tricolor Colombian Flag Ribbons at Base of Shield -->
      <g transform="translate(0, 48)">
        <!-- Yellow band -->
        <path d="M-36,0 Q0,8 36,0 L34,7 Q0,15 -34,7 Z" fill="url(#flagYellow)" stroke="#B89B00" stroke-width="0.5"/>
        <!-- Blue band -->
        <path d="M-34,7 Q0,15 34,7 L32,12 Q0,20 -32,12 Z" fill="url(#flagBlue)" stroke="#001848" stroke-width="0.5"/>
        <!-- Red band -->
        <path d="M-32,12 Q0,20 32,12 L30,17 Q0,25 -30,17 Z" fill="url(#flagRed)" stroke="#7A000A" stroke-width="0.5"/>
      </g>

      <!-- Lower Golden Banner with Institutional Motto -->
      <g transform="translate(0, 72)">
        <!-- Ribbon Ends -->
        <polygon points="-78,-2 -90,-8 -86,5 -92,16 -78,10" fill="#C69214" stroke="#664600" stroke-width="0.5"/>
        <polygon points="78,-2 90,-8 86,5 92,16 78,10" fill="#C69214" stroke="#664600" stroke-width="0.5"/>
        <!-- Ribbon Body -->
        <path d="M-80,-2 Q0,8 80,-2 L78,11 Q0,20 -78,11 Z" fill="url(#goldGrad)" stroke="#704D02" stroke-width="0.8"/>
        <!-- Motto Text -->
        <text x="0" y="7.5" text-anchor="middle" font-family="'Times New Roman', Times, serif" font-style="italic" font-weight="bold" font-size="6.2" fill="#1F1500" letter-spacing="0.2">
          EDUCAR LA VOLUNTAD Y FORMAR LA PERSONALIDAD
        </text>
      </g>
    </g>

    <!-- RIGHT SIDE / CENTER: INSTITUTIONAL TYPOGRAPHY -->
    <g transform="translate(580, 50)" text-anchor="middle">
      <!-- Title: Colegio Militar Almirante Colón -->
      <text x="0" y="25" font-family="'Times New Roman', 'Georgia', serif" font-size="34" font-weight="bold" fill="#1A202C" letter-spacing="0.5">
        Colegio Militar Almirante Colón
      </text>

      <!-- Motto: “Educar la Voluntad y Formar la Personalidad” -->
      <text x="0" y="65" font-family="'Times New Roman', 'Georgia', serif" font-style="italic" font-size="27" fill="#2D3748" letter-spacing="0.3">
        “Educar la Voluntad y Formar la Personalidad”
      </text>

      <!-- Location: Cereté – Córdoba -->
      <text x="0" y="102" font-family="'Times New Roman', 'Georgia', serif" font-style="italic" font-weight="bold" font-size="26" fill="#374151" letter-spacing="0.5">
        Cereté – Córdoba
      </text>

      <!-- Subtitle banner / document title -->
      <text x="0" y="152" font-family="'Arial Black', Arial, 'Helvetica Neue', sans-serif" font-weight="900" font-size="20" fill="#0F172A" letter-spacing="1">
        INFORME DE SEGUIMIENTO COMPORTAMENTAL Y ACADÉMICO
      </text>

      <!-- Underline bar -->
      <line x1="-320" y1="164" x2="320" y2="164" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}
