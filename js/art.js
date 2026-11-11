/* Sproke — the cast and the icons. All artwork is original, drawn here as inline SVG. */
(function (S) {
  'use strict';

  var INK = '#1B2638';
  function svg(body, label, vb) {
    return '<svg viewBox="' + (vb || '0 0 200 200') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '">' + body + '</svg>';
  }
  function eye(cx, cy, r, look) {
    var dx = look || 0;
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff"/>' +
      '<circle cx="' + (cx + dx) + '" cy="' + (cy + 2) + '" r="' + (r * 0.5) + '" fill="' + INK + '"/>' +
      '<circle cx="' + (cx + dx + r * 0.2) + '" cy="' + (cy - r * 0.12) + '" r="' + (r * 0.17) + '" fill="#fff"/>';
  }

  /** Brumle the troll — the guide. mood: happy | cheer | sad | think */
  function troll(mood) {
    mood = mood || 'happy';
    var G = '#5DB075', GD = '#3E8E5A', GDD = '#2F6B45', BELLY = '#C4E9CB', NOSE = '#F2A07B';
    var cheer = mood === 'cheer', sad = mood === 'sad', think = mood === 'think';
    var arms = cheer
      ? '<ellipse cx="30" cy="96" rx="12" ry="24" transform="rotate(-28 30 96)" fill="' + GD + '"/><ellipse cx="170" cy="96" rx="12" ry="24" transform="rotate(28 170 96)" fill="' + GD + '"/>'
      : think
        ? '<ellipse cx="34" cy="146" rx="12" ry="21" transform="rotate(18 34 146)" fill="' + GD + '"/><ellipse cx="146" cy="142" rx="12" ry="22" transform="rotate(48 146 142)" fill="' + GD + '"/>'
        : '<ellipse cx="34" cy="146" rx="12" ry="21" transform="rotate(18 34 146)" fill="' + GD + '"/><ellipse cx="166" cy="146" rx="12" ry="21" transform="rotate(-18 166 146)" fill="' + GD + '"/>';
    var mouth = cheer
      ? '<path d="M74 134 Q100 140 126 134 Q122 162 100 162 Q78 162 74 134Z" fill="#7A2E3A"/><path d="M86 152 Q100 144 114 152 Q108 161 100 161 Q92 161 86 152Z" fill="#F2838F"/><rect x="83" y="133" width="11" height="12" rx="4" fill="#fff"/>'
      : sad
        ? '<path d="M78 148 Q100 134 122 148" stroke="#1F4D33" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="84" y="134" width="10" height="11" rx="4" fill="#fff"/>'
        : think
          ? '<path d="M84 142 Q100 146 116 138" stroke="#1F4D33" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="86" y="131" width="10" height="11" rx="4" fill="#fff"/>'
          : '<path d="M74 136 Q100 158 126 136" stroke="#1F4D33" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="84" y="133" width="10" height="13" rx="4" fill="#fff"/>';
    var brows = sad
      ? '<path d="M58 72 L86 64" stroke="' + GDD + '" stroke-width="6" stroke-linecap="round"/><path d="M142 72 L114 64" stroke="' + GDD + '" stroke-width="6" stroke-linecap="round"/>'
      : think ? '<path d="M58 66 L86 70" stroke="' + GDD + '" stroke-width="6" stroke-linecap="round"/><path d="M114 62 L142 58" stroke="' + GDD + '" stroke-width="6" stroke-linecap="round"/>' : '';
    var look = think ? 4 : 0;
    return svg(
      '<path d="M150 164 C190 168 194 132 176 122" fill="none" stroke="' + GD + '" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M166 118 C168 104 184 102 186 114 C192 122 184 132 174 130 C166 130 162 124 166 118Z" fill="' + GDD + '"/>' +
      '<ellipse cx="72" cy="183" rx="25" ry="12" fill="' + GD + '"/><ellipse cx="128" cy="183" rx="25" ry="12" fill="' + GD + '"/>' +
      '<ellipse cx="28" cy="94" rx="22" ry="14" transform="rotate(-24 28 94)" fill="' + G + '"/><ellipse cx="31" cy="94" rx="12" ry="6.5" transform="rotate(-24 31 94)" fill="' + NOSE + '"/>' +
      '<ellipse cx="172" cy="94" rx="22" ry="14" transform="rotate(24 172 94)" fill="' + G + '"/><ellipse cx="169" cy="94" rx="12" ry="6.5" transform="rotate(24 169 94)" fill="' + NOSE + '"/>' +
      '<path d="M100 34 C146 34 168 68 168 112 C168 158 142 186 100 186 C58 186 32 158 32 112 C32 68 54 34 100 34Z" fill="' + G + '"/>' +
      '<ellipse cx="100" cy="160" rx="38" ry="22" fill="' + BELLY + '"/>' +
      arms +
      '<path d="M60 54 C52 34 70 22 80 38 C80 16 102 12 106 34 C114 14 136 22 128 42 C142 32 152 46 140 58 C120 42 82 42 60 54Z" fill="' + GDD + '"/>' +
      '<path d="M100 30 C100 18 104 10 112 6" stroke="#7A5C3A" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="118" cy="8" rx="9" ry="5" transform="rotate(-25 118 8)" fill="#8FD694"/><ellipse cx="98" cy="14" rx="8" ry="4.5" transform="rotate(35 98 14)" fill="#8FD694"/>' +
      eye(74, 92, 17, look) + eye(126, 92, 17, look ? look : 0) + brows +
      '<ellipse cx="100" cy="114" rx="16" ry="19" fill="' + NOSE + '"/><ellipse cx="95" cy="106" rx="5" ry="6" fill="#F9C9AE"/>' +
      mouth, 'Brumle the troll');
  }

  /** Nils the nisse — barn guardian. */
  function nisse() {
    return svg(
      '<ellipse cx="100" cy="170" rx="58" ry="26" fill="#6F7F97"/>' +
      '<path d="M48 108 C34 150 58 190 100 190 C142 190 166 150 152 108Z" fill="#EEF2F6"/>' +
      '<ellipse cx="100" cy="104" rx="42" ry="27" fill="#F8CDB0"/>' +
      '<circle cx="68" cy="112" r="9" fill="#F29C9C" opacity=".75"/><circle cx="132" cy="112" r="9" fill="#F29C9C" opacity=".75"/>' +
      '<circle cx="82" cy="102" r="5.5" fill="' + INK + '"/><circle cx="118" cy="102" r="5.5" fill="' + INK + '"/>' +
      '<circle cx="83.5" cy="100.5" r="1.8" fill="#fff"/><circle cx="119.5" cy="100.5" r="1.8" fill="#fff"/>' +
      '<path d="M100 124 C86 116 62 122 56 140 C76 146 94 138 100 128 C106 138 124 146 144 140 C138 122 114 116 100 124Z" fill="#fff"/>' +
      '<ellipse cx="100" cy="116" rx="13" ry="11" fill="#EE9E7E"/><ellipse cx="96" cy="112" rx="4" ry="3.5" fill="#F8C4AC"/>' +
      '<path d="M50 96 C52 54 80 14 128 10 C152 8 168 24 164 40 C152 32 138 36 136 48 C146 62 150 80 150 96 C120 82 80 82 50 96Z" fill="#E5484D"/>' +
      '<path d="M128 10 C152 8 168 24 164 40 C152 32 138 36 136 48 C132 34 132 20 128 10Z" fill="#C8363C"/>' +
      '<path d="M46 100 C80 80 120 80 154 100 L152 110 C120 92 80 92 48 110Z" fill="#B5333A"/>' +
      '<circle cx="166" cy="44" r="9" fill="#fff"/>', 'Nils the nisse');
  }

  /** Hulda the huldra — forest spirit with a cow's tail. */
  function huldra() {
    var HAIR = '#F3C24B', HAIRD = '#DDA72E';
    return svg(
      '<path d="M146 176 C180 178 190 150 176 136" fill="none" stroke="#C99A6B" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M168 132 C168 118 184 116 186 128 C192 138 182 146 174 142 C168 142 164 138 168 132Z" fill="#8A5A2B"/>' +
      '<path d="M50 88 C44 36 156 36 150 88 C158 132 150 168 162 192 L38 192 C50 168 42 132 50 88Z" fill="' + HAIR + '"/>' +
      '<path d="M58 192 C58 154 78 142 100 142 C122 142 142 154 142 192Z" fill="#3DA35D"/>' +
      '<path d="M84 142 Q100 160 116 142 Q100 150 84 142Z" fill="#2B7E45"/>' +
      '<rect x="90" y="120" width="20" height="26" rx="9" fill="#F3C4A4"/>' +
      '<ellipse cx="100" cy="94" rx="36" ry="38" fill="#FBD7BD"/>' +
      '<path d="M62 92 C60 52 140 52 138 92 C126 72 108 66 100 78 C92 66 74 72 62 92Z" fill="' + HAIR + '"/>' +
      '<path d="M100 78 C96 70 88 66 80 68" stroke="' + HAIRD + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="85" cy="98" rx="4.5" ry="6" fill="' + INK + '"/><ellipse cx="115" cy="98" rx="4.5" ry="6" fill="' + INK + '"/>' +
      '<circle cx="86.5" cy="96" r="1.6" fill="#fff"/><circle cx="116.5" cy="96" r="1.6" fill="#fff"/>' +
      '<circle cx="74" cy="110" r="7" fill="#F29C9C" opacity=".6"/><circle cx="126" cy="110" r="7" fill="#F29C9C" opacity=".6"/>' +
      '<path d="M90 114 Q100 123 110 114" stroke="#B5564A" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      [[62, 70, '#fff'], [76, 58, '#F28CB1'], [92, 52, '#fff'], [108, 52, '#7EC8F2'], [124, 58, '#fff'], [138, 70, '#F28CB1']].map(function (f) {
        return '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="8" fill="' + f[2] + '"/><circle cx="' + f[0] + '" cy="' + f[1] + '" r="3" fill="#F2A20C"/>';
      }).join('') +
      '<ellipse cx="69" cy="62" rx="6" ry="3.5" transform="rotate(-40 69 62)" fill="#3DA35D"/><ellipse cx="131" cy="62" rx="6" ry="3.5" transform="rotate(40 131 62)" fill="#3DA35D"/>',
      'Hulda the huldra');
  }

  /** The biggest Billy Goat Bruse. */
  function bukk() {
    return svg(
      '<path d="M72 62 C46 40 48 10 78 6" fill="none" stroke="#C9B08A" stroke-width="15" stroke-linecap="round"/>' +
      '<path d="M128 62 C154 40 152 10 122 6" fill="none" stroke="#C9B08A" stroke-width="15" stroke-linecap="round"/>' +
      '<path d="M58 34 L70 28 M56 22 L68 18" stroke="#A88F68" stroke-width="4" stroke-linecap="round"/><path d="M142 34 L130 28 M144 22 L132 18" stroke="#A88F68" stroke-width="4" stroke-linecap="round"/>' +
      '<ellipse cx="38" cy="90" rx="24" ry="12" transform="rotate(-22 38 90)" fill="#EDE3D2"/><ellipse cx="40" cy="90" rx="14" ry="6" transform="rotate(-22 40 90)" fill="#F2B6A8"/>' +
      '<ellipse cx="162" cy="90" rx="24" ry="12" transform="rotate(22 162 90)" fill="#EDE3D2"/><ellipse cx="160" cy="90" rx="14" ry="6" transform="rotate(22 160 90)" fill="#F2B6A8"/>' +
      '<path d="M88 160 C88 180 94 194 100 198 C106 194 112 180 112 160Z" fill="#E2D5BD"/>' +
      '<path d="M100 46 C138 46 152 74 148 106 C144 142 126 170 100 170 C74 170 56 142 52 106 C48 74 62 46 100 46Z" fill="#F7F1E6"/>' +
      '<path d="M82 48 C86 62 94 68 100 60 C106 68 114 62 118 48 C108 44 92 44 82 48Z" fill="#E2D5BD"/>' +
      '<ellipse cx="100" cy="142" rx="27" ry="21" fill="#EADFCB"/>' +
      '<path d="M90 132 Q100 128 110 132 Q106 142 100 142 Q94 142 90 132Z" fill="#7A5C4A"/>' +
      '<path d="M100 142 V150 M88 152 Q94 158 100 150 Q106 158 112 152" stroke="#7A5C4A" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="76" cy="100" r="13" fill="#F2C744"/><rect x="67" y="96.5" width="18" height="7" rx="3.5" fill="' + INK + '"/>' +
      '<circle cx="124" cy="100" r="13" fill="#F2C744"/><rect x="115" y="96.5" width="18" height="7" rx="3.5" fill="' + INK + '"/>' +
      '<path d="M62 84 L88 82" stroke="#C9B08A" stroke-width="5" stroke-linecap="round"/><path d="M138 84 L112 82" stroke="#C9B08A" stroke-width="5" stroke-linecap="round"/>',
      'The biggest Billy Goat Bruse');
  }

  /** Nøkken — the water spirit in the tarn. */
  function nokk() {
    return svg(
      '<ellipse cx="100" cy="150" rx="92" ry="34" fill="#BFEDE6"/>' +
      '<path d="M36 150 C36 92 64 62 100 62 C136 62 164 92 164 150Z" fill="#1F4E55"/>' +
      '<path d="M52 104 C40 118 44 140 38 152 M66 84 C56 100 60 126 54 148 M148 104 C160 118 156 140 162 152 M134 84 C144 100 140 126 146 148" stroke="#2F7A72" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<circle cx="76" cy="112" r="16" fill="#FBE98A"/><ellipse cx="76" cy="113" rx="5" ry="10" fill="#12313A"/>' +
      '<circle cx="124" cy="112" r="16" fill="#FBE98A"/><ellipse cx="124" cy="113" rx="5" ry="10" fill="#12313A"/>' +
      '<circle cx="76" cy="112" r="21" fill="#FBE98A" opacity=".22"/><circle cx="124" cy="112" r="21" fill="#FBE98A" opacity=".22"/>' +
      '<ellipse cx="104" cy="66" rx="34" ry="11" fill="#4FB286"/><path d="M104 66 L138 60 L136 70Z" fill="#1F4E55"/>' +
      [-50, -25, 0, 25, 50].map(function (a) {
        return '<ellipse cx="96" cy="46" rx="7" ry="16" transform="rotate(' + a + ' 96 62)" fill="' + (a % 50 === 0 ? '#fff' : '#FBD3E0') + '"/>';
      }).join('') +
      '<circle cx="96" cy="58" r="6" fill="#F2C744"/>' +
      '<path d="M0 146 Q17 134 34 146 T68 146 T102 146 T136 146 T170 146 T204 146 V200 H0Z" fill="#35B3A6"/>' +
      '<path d="M0 166 Q17 156 34 166 T68 166 T102 166 T136 166 T170 166 T204 166 V200 H0Z" fill="#1E9488"/>' +
      '<path d="M54 158 h22 M124 160 h26 M88 180 h30" stroke="#BFEDE6" stroke-width="4" stroke-linecap="round" opacity=".8"/>',
      'Nøkken, the water spirit');
  }

  /** Fossegrimen — fiddler under the waterfall. */
  function grim() {
    var HAIR = '#1F5FA8', SKIN = '#CFEAF7';
    return svg(
      '<path d="M40 0 h24 v200 h-24z M88 0 h18 v200 h-18z M138 0 h26 v200 h-26z" fill="#D9EEFB" opacity=".9"/>' +
      '<path d="M54 82 C46 34 154 34 146 82 C152 122 160 158 150 196 L50 196 C40 158 48 122 54 82Z" fill="' + HAIR + '"/>' +
      '<path d="M60 196 C60 158 80 146 100 146 C120 146 140 158 140 196Z" fill="#2E86DE"/>' +
      '<ellipse cx="100" cy="92" rx="35" ry="37" fill="' + SKIN + '"/>' +
      '<path d="M64 88 C64 50 136 50 136 88 C124 74 112 70 104 80 C98 68 76 70 64 88Z" fill="' + HAIR + '"/>' +
      '<path d="M78 96 Q85 102 92 96 M108 96 Q115 102 122 96" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="74" cy="108" r="6.5" fill="#8CC8EE" opacity=".8"/><circle cx="126" cy="108" r="6.5" fill="#8CC8EE" opacity=".8"/>' +
      '<path d="M92 112 Q100 119 108 112" stroke="#3D6E99" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<g transform="rotate(-32 92 150)">' +
      '<rect x="20" y="144" width="62" height="9" rx="4" fill="#5B3A1E"/>' +
      '<ellipse cx="96" cy="148" rx="20" ry="17" fill="#C7772E"/><ellipse cx="122" cy="148" rx="23" ry="20" fill="#C7772E"/>' +
      '<ellipse cx="108" cy="148" rx="8" ry="12" fill="#A85E1F"/>' +
      '<path d="M22 146.5 H134 M22 150.5 H134" stroke="#F4E3C3" stroke-width="1.6"/>' +
      '<rect x="12" y="140" width="12" height="17" rx="4" fill="#3D2511"/></g>' +
      '<path d="M40 176 L164 112" stroke="#F4E3C3" stroke-width="4" stroke-linecap="round"/><path d="M40 176 L164 112" stroke="#8A5A2B" stroke-width="1.5"/>' +
      '<circle cx="48" cy="172" r="11" fill="' + SKIN + '"/><circle cx="150" cy="128" r="11" fill="' + SKIN + '"/>' +
      '<path d="M170 60 q8 12 0 18 q-8 -6 0 -18z M26 104 q7 10 0 16 q-7 -6 0 -16z" fill="#7EC8F2"/>',
      'Fossegrimen, the waterfall fiddler');
  }

  /** Draugen — the sea ghost in oilskins, head of seaweed. */
  function draug() {
    var Y = '#F5C02E', YD = '#D69A12', WEED = '#2A6B5C', WEEDL = '#3E9079';
    return svg(
      '<path d="M40 198 C40 156 68 140 100 140 C132 140 160 156 160 198Z" fill="' + Y + '"/>' +
      '<path d="M100 140 V198" stroke="' + YD + '" stroke-width="4"/><circle cx="110" cy="162" r="4.5" fill="' + YD + '"/><circle cx="110" cy="182" r="4.5" fill="' + YD + '"/>' +
      '<path d="M58 78 C54 120 62 148 100 150 C138 148 146 120 142 78Z" fill="' + WEED + '"/>' +
      '<path d="M62 120 C56 136 62 150 54 164 M78 140 C74 154 80 164 74 176 M122 140 C126 154 120 164 126 176 M138 120 C144 136 138 150 146 164 M100 146 C98 158 104 166 100 178" stroke="' + WEED + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<path d="M66 122 C64 132 68 138 64 146 M134 122 C136 132 132 138 136 146" stroke="' + WEEDL + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="80" cy="112" r="14" fill="#E9FFF6"/><circle cx="82" cy="114" r="6" fill="' + INK + '"/>' +
      '<circle cx="120" cy="112" r="14" fill="#E9FFF6"/><circle cx="118" cy="114" r="6" fill="' + INK + '"/>' +
      '<circle cx="80" cy="112" r="19" fill="#B8FFE5" opacity=".2"/><circle cx="120" cy="112" r="19" fill="#B8FFE5" opacity=".2"/>' +
      '<path d="M84 134 l6 6 l6 -6 l6 6 l6 -6 l6 6" stroke="#12313A" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M52 80 C52 40 76 22 100 22 C124 22 148 40 148 80Z" fill="' + Y + '"/>' +
      '<path d="M28 80 C52 62 148 62 178 88 C150 92 60 92 28 80Z" fill="' + YD + '"/>' +
      '<path d="M100 22 V72" stroke="' + YD + '" stroke-width="4"/>' +
      '<path d="M128 40 l3.5 7 l8 1 l-6 5.5 l1.5 8 l-7 -4 l-7 4 l1.5 -8 l-6 -5.5 l8 -1z" fill="#F2784B"/>',
      'Draugen, the sea ghost');
  }

  /** Kvitebjørn kong Valemon — the white bear king. */
  function bjorn() {
    return svg(
      '<circle cx="52" cy="70" r="22" fill="#F7FAFD"/><circle cx="52" cy="70" r="11" fill="#C9D8E8"/>' +
      '<circle cx="148" cy="70" r="22" fill="#F7FAFD"/><circle cx="148" cy="70" r="11" fill="#C9D8E8"/>' +
      '<path d="M100 44 C148 44 170 78 170 118 C170 162 140 190 100 190 C60 190 30 162 30 118 C30 78 52 44 100 44Z" fill="#F7FAFD"/>' +
      '<path d="M36 142 C50 176 78 190 100 190 C122 190 150 176 164 142 C150 166 126 178 100 178 C74 178 50 166 36 142Z" fill="#DCE7F2"/>' +
      '<ellipse cx="100" cy="138" rx="30" ry="24" fill="#E6EEF6"/>' +
      '<path d="M86 124 Q100 118 114 124 Q110 138 100 138 Q90 138 86 124Z" fill="' + INK + '"/>' +
      '<path d="M100 138 V146 M86 148 Q93 156 100 146 Q107 156 114 148" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="72" cy="108" r="7" fill="' + INK + '"/><circle cx="128" cy="108" r="7" fill="' + INK + '"/>' +
      '<circle cx="74" cy="106" r="2.2" fill="#fff"/><circle cx="130" cy="106" r="2.2" fill="#fff"/>' +
      '<circle cx="58" cy="128" r="9" fill="#F7B6C2" opacity=".7"/><circle cx="142" cy="128" r="9" fill="#F7B6C2" opacity=".7"/>' +
      '<path d="M64 58 L60 16 L80 36 L100 8 L120 36 L140 16 L136 58 C114 50 86 50 64 58Z" fill="#F5C02E"/>' +
      '<path d="M64 58 C86 50 114 50 136 58 L135 48 C114 41 86 41 65 48Z" fill="#D69A12"/>' +
      '<circle cx="100" cy="30" r="6" fill="#E5484D"/><circle cx="72" cy="40" r="4.5" fill="#2E86DE"/><circle cx="128" cy="40" r="4.5" fill="#2E86DE"/>',
      'Kvitebjørn, the white bear king');
  }

  S.art = {
    troll: troll, nisse: nisse, huldra: huldra, bukk: bukk, nokk: nokk, grim: grim, draug: draug, bjorn: bjorn,
    host: function (name, mood) { return name === 'troll' ? troll(mood) : (S.art[name] || troll)(); }
  };

  // ---------- runes for the lesson stones (Elder Futhark, drawn as strokes) ----------
  var RUNES = [
    'M8 3V21M8 9L16 5M8 14L16 10', 'M7 21V4L17 10V21', 'M8 3V21M8 8L15 12L8 16', 'M8 3V21M8 5L16 10M8 10L16 15',
    'M8 21V3L15 7.5L8 12L16 21', 'M16 4L8 12L16 20', 'M6 4L18 20M18 4L6 20', 'M8 21V3L15 7.5L8 12',
    'M7 3V21M17 3V21M7 9L17 14', 'M12 3V21M7 9L17 15', 'M12 21V4M6 10L12 4L18 10', 'M8 3V21M8 3L15 7.5L8 12L15 16.5L8 21',
    'M6 21V3L18 12M18 21V3L6 12', 'M9 21V3L16 9', 'M6 21L15.5 9.5L12 5L8.5 9.5L18 21', 'M16 4L8 9L16 15L8 20'
  ];
  S.rune = function (i) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + RUNES[i % RUNES.length] + '" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  };

  // ---------- icons ----------
  function ic(d, extra) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' + (extra || '') + '</svg>';
  }
  S.icons = {
    path: ic('M5 20c0-5 14-3 14-8S5 9 5 4', '<circle cx="5" cy="4" r="1.8" fill="currentColor"/><circle cx="5" cy="20" r="1.8" fill="currentColor"/>'),
    practice: ic('M4 15h16M7 15v4h10v-4M6 15c0-3 2-4 6-4h7c-1 3-3 4-6 4', '<path d="M9 7l3-3 3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    book: ic('M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v13'),
    user: ic('M5 20c0-4 3-6 7-6s7 2 7 6', '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2.2"/>'),
    close: ic('M6 6l12 12M18 6L6 18'),
    check: ic('M5 12.5l4.5 4.5L19 7.5'),
    speaker: ic('M4 10v4h3l5 4V6L7 10zM16 9c1 1 1 5 0 6M18.5 6.5c2.5 3 2.5 8 0 11'),
    chevron: ic('M9 6l6 6-6 6'),
    back: ic('M15 6l-6 6 6 6'),
    bulb: ic('M9 18h6M10 21h4M8 14c-2-1.5-3-3.5-3-5.5a7 7 0 0114 0c0 2-1 4-3 5.5v1H8z'),
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z" fill="currentColor"/></svg>',
    flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 11a6 6 0 01-12 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-4 1-7 2-9.5z" fill="#F2784B"/><path d="M12 11c.600 2 3 3 3 5.2a3 3 0 01-6 0c0-1.3.800-2 1.3-2.7.200 1 .700 1.5 1.2 1.5 0-1.6.200-3 .500-4z" fill="#F5C02E"/><path d="M4 21l16-3M4 18l16 3" stroke="#8A5A2B" stroke-width="2.4" stroke-linecap="round"/></svg>',
    stone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 22c-2-4-3-9-1-14 1-3 3-6 6-6s5 3 6 6c2 5 1 10-1 14z" fill="#8FA1B8"/><path d="M12 6v11M12 8l4 3M12 12l4 3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    ghost: ic('M6 21V10a6 6 0 0112 0v11l-3-2-3 2-3-2z', '<circle cx="10" cy="11" r="1.3" fill="currentColor"/><circle cx="14" cy="11" r="1.3" fill="currentColor"/>')
  };
})(globalThis.Sproke = globalThis.Sproke || {});
