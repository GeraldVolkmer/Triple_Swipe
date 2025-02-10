/*********************************************
 * Triple-Swipe Logik (Push + Überlappung + Z-Order)
 *********************************************/

// Referenzen auf DOM-Elemente
const container = document.getElementById('swipe-container');
const layer1 = document.getElementById('layer1');
const layer2 = document.getElementById('layer2');
const layer3 = document.getElementById('layer3');
const handle1 = document.getElementById('handle1');
const handle2 = document.getElementById('handle2');

// Container-Abmessungen
const WIDTH = 1440;
const HEIGHT = 1080;

/* Griffbox-Breite => 40px
   Balkenmitte = handleX + 20
   Es wird erlaubt mit der Balkenmitte, 
   bis an den Rand 0..800 zu gehen => 
   handleX: -20..780 */
const MIN_HANDLE_X = -20;
const MAX_HANDLE_X = 1420;

// Minimaler Abstand für den "Push" in der Mitte
const MIN_GAP = 50;

// Start-Positionen der Griffe
let handle1X = 260;
let handle2X = 1120;

// Flags: "Wird gerade gezogen?"
let isDraggingHandle1 = false;
let isDraggingHandle2 = false;


/*********************************************
 * Hilfsfunktionen
 *********************************************/

// Begrenze value auf [min, max]
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

// Gibt die Balkenmitte von Griff1 / Griff2
function boundary1() {
  return handle1X + 20;
}
function boundary2() {
  return handle2X + 20;
}

// Prüfe, ob Griff1 < Griff2 (keine Überlappung)
// => "geordnete" Lage
function isOrdered() {
  return handle1X <= handle2X;
}

// Griff1 ganz links?
function isHandle1AtLeftEdge() {
  return handle1X <= (MIN_HANDLE_X + 0.001);
}

// Griff2 ganz rechts?
function isHandle2AtRightEdge() {
  return handle2X >= (MAX_HANDLE_X - 0.001);
}

// Aktualisiere die Ausschnitte (clip) der drei Bilder
function updateClips() {
  const b1 = boundary1();
  const b2 = boundary2();
  layer1.style.clip = `rect(0, ${b1}px, ${HEIGHT}px, 0)`;
  layer2.style.clip = `rect(0, ${b2}px, ${HEIGHT}px, ${b1}px)`;
  layer3.style.clip = `rect(0, ${WIDTH}px, ${HEIGHT}px, ${b2}px)`;
}

// Dynamische Z-Reihenfolge: 
// Definition der Griffe, welcher gerade "oben" liegen soll mittels z-index
function updateZOrder() {
  if (handle2X <= MIN_HANDLE_X) {
    // Griff2 liegt bei minimum x => handle2 oben
    handle2.style.zIndex = 5;
    handle1.style.zIndex = 4;
  } else {
    // Griff1 oben => handle1 oben
    handle1.style.zIndex = 5;
    handle2.style.zIndex = 4;
  }
}

// Wendet Positionen an + aktualisiert clip und z-Order
function applyPositions() {
  handle1.style.left = handle1X + 'px';
  handle2.style.left = handle2X + 'px';
  updateClips();
  updateZOrder();
}


/*********************************************
 * Move-Funktionen (Push & Überlappung)
 *********************************************/

// Griff1 bewegen
function moveHandle1(newX) {
  newX = clamp(newX, MIN_HANDLE_X, MAX_HANDLE_X);

  // Push nur, wenn:
  //  - isOrdered() = true (Griff1 < Griff2)
  //  - Griff1 nicht ganz links
  if (isOrdered() && !isHandle1AtLeftEdge()) {
    // boundary1()+MIN_GAP <= boundary2()?
    if ((newX + MIN_GAP) > handle2X) {
      handle2X = newX + MIN_GAP;
      handle2X = clamp(handle2X, MIN_HANDLE_X, MAX_HANDLE_X);
    }
  }

  handle1X = newX;
  applyPositions();
}

// Griff2 bewegen
function moveHandle2(newX) {
  newX = clamp(newX, MIN_HANDLE_X, MAX_HANDLE_X);

  // Push nur, wenn:
  //  - isOrdered() = true (Griff1 < Griff2)
  //  - Griff2 nicht ganz rechts
  if (isOrdered() && !isHandle2AtRightEdge()) {
    // boundary2()-MIN_GAP >= boundary1()
    if ((newX - MIN_GAP) < handle1X) {
      handle1X = newX - MIN_GAP;
      handle1X = clamp(handle1X, MIN_HANDLE_X, MAX_HANDLE_X);
    }
  }

  handle2X = newX;
  applyPositions();
}


/*********************************************
 * Pointer Events
 *********************************************/
handle1.addEventListener('pointerdown', (e) => {
  isDraggingHandle1 = true;
  handle1.setPointerCapture(e.pointerId);
});
handle1.addEventListener('pointermove', (e) => {
  if (!isDraggingHandle1) return;
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  moveHandle1(x);
});
handle1.addEventListener('pointerup', (e) => {
  isDraggingHandle1 = false;
  handle1.releasePointerCapture(e.pointerId);
});

handle2.addEventListener('pointerdown', (e) => {
  isDraggingHandle2 = true;
  handle2.setPointerCapture(e.pointerId);
});
handle2.addEventListener('pointermove', (e) => {
  if (!isDraggingHandle2) return;
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  moveHandle2(x);
});
handle2.addEventListener('pointerup', (e) => {
  isDraggingHandle2 = false;
  handle2.releasePointerCapture(e.pointerId);
});


/*********************************************
 * Initialisierung
 *********************************************/
applyPositions(); 
// (Setzt die Startpositionen und aktualisiert Clips & Z-Order)
