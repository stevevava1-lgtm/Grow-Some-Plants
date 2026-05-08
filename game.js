const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menuOverlay = document.getElementById("menuOverlay");
const menuTitle = document.getElementById("menuTitle");
const menuDesc = document.getElementById("menuDesc");
const menuActions = document.getElementById("menuActions");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const petPanelOverlay = document.getElementById("petPanelOverlay");
const petPanelTitle = document.getElementById("petPanelTitle");
const petPanelDesc = document.getElementById("petPanelDesc");
const petPanelTimer = document.getElementById("petPanelTimer");
const petPanelPickUpBtn = document.getElementById("petPanelPickUpBtn");
const petPanelCloseBtn = document.getElementById("petPanelCloseBtn");
const petMutationFeedList = document.getElementById("petMutationFeedList");
const prereleaseOverlay = document.getElementById("prereleaseOverlay");
const prereleaseClaimBtn = document.getElementById("prereleaseClaimBtn");
const prereleaseLaterBtn = document.getElementById("prereleaseLaterBtn");
const redeemCodeBtn = document.getElementById("redeemCodeBtn");

const player = {
  x: 460,
  y: 400,
  radius: 24,
  speed: 3.3,
  color: "#8a4fff",
};

const gameState = {
  money: 20,
  rainbowCoins: 0,
  selectedHotbar: 0,
  inventoryOpen: false,
  openMenuType: null,
  petPanelOpen: false,
  prereleaseRewardClaimed: false,
  prereleaseOverlayOpen: false,
  /** If true, load failed; do not write localStorage so the original blob can be recovered. */
  skipLocalStorageWrites: false,
  message: "",
  messageUntil: 0,
};

const STORAGE_KEY = "grow_some_plants_save";
const LEGACY_STORAGE_KEYS = ["grow_some_plants_save_v2", "grow_some_plants_save_v1"];

const items = {
  carrotSeed: {
    id: "carrotSeed",
    name: "Carrot Seed",
    icon: "seed",
    price: 5,
    tint: "#d6862f",
    stackable: true,
  },
  mintSeed: {
    id: "mintSeed",
    name: "Mint Seed",
    icon: "mintSeed",
    price: 70,
    tint: "#5eb88a",
    stackable: true,
  },
  carrot: {
    id: "carrot",
    name: "Carrot",
    icon: "carrot",
    sellPrice: 8,
    tint: "#e8721d",
    stackable: false,
  },
  mint: {
    id: "mint",
    name: "Mint",
    icon: "mint",
    sellPrice: 110,
    tint: "#6ecf9a",
    stackable: true,
  },
  tomatoSeed: {
    id: "tomatoSeed",
    name: "Tomato Seed",
    icon: "tomatoSeed",
    price: 500,
    tint: "#c94a3a",
    stackable: true,
  },
  tomato: {
    id: "tomato",
    name: "Tomato",
    icon: "tomato",
    sellPrice: 60,
    tint: "#e63b2e",
    stackable: false,
  },
  roseSeed: {
    id: "roseSeed",
    name: "Rose Bush Seed",
    icon: "roseSeed",
    price: 4000,
    tint: "#c43d5c",
    stackable: true,
  },
  rose: {
    id: "rose",
    name: "Rose",
    icon: "rose",
    sellPrice: 200,
    tint: "#e85a7a",
    stackable: false,
  },
  shovel: {
    id: "shovel",
    name: "Shovel",
    icon: "shovel",
    price: 1000,
    tint: "#7a7a8a",
    stackable: true,
  },
  commonEgg: {
    id: "commonEgg",
    name: "Common Egg",
    icon: "egg",
    price: 5000,
    tint: "#f0e6d8",
    stackable: true,
  },
  petDog: {
    id: "petDog",
    name: "Dog",
    icon: "petDog",
    tint: "#c4804d",
    stackable: false,
  },
  petBunny: {
    id: "petBunny",
    name: "Bunny",
    icon: "petBunny",
    tint: "#c9b8a8",
    stackable: false,
  },
  petCat: {
    id: "petCat",
    name: "Cat",
    icon: "petCat",
    tint: "#9c8c7c",
    stackable: false,
  },
  petTrafficGreen: {
    id: "petTrafficGreen",
    name: "Green Guy [Legendary]",
    icon: "petTrafficGreen",
    tint: "#2ee85a",
    stackable: false,
  },
  petTrafficRed: {
    id: "petTrafficRed",
    name: "Red Guy [Legendary]",
    icon: "petTrafficRed",
    tint: "#e02020",
    stackable: false,
  },
  fertilizerBag: {
    id: "fertilizerBag",
    name: "Fertilizer Bag",
    icon: "fertilizerBag",
    tint: "#9b8a68",
    stackable: false,
  },
};

const inventory = Array.from({ length: 100 }, () => null);

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const WEST_GARDEN_W = 400;
const MAIN_GARDEN_W = 670;
const LEFT_COMMERCE_W = 300;
const DIRT_X = LEFT_COMMERCE_W;
const DIRT_WIDTH = WEST_GARDEN_W + MAIN_GARDEN_W;
const DIRT_RIGHT = DIRT_X + DIRT_WIDTH;
const SHOP_ZONE_W = 280;
const CLEARING_W = MAIN_GARDEN_W;

const CAT_NAP_RADIUS = 168;
const CAT_NAP_GROWTH_BONUS_MS = 20000;
const BUNNY_EAT_INTERVAL_MS = 120000;
const TRAFFIC_PET_MUTATION_INTERVAL_MS = 120000;
const GOLD_MUTATION_CHANCE = 0.05;
const GOLD_MUTATION_MULT = 4;
const EFFECT_MUTATION_MULT = 2;
const CAT_TICK_INTERVAL_MS = 120000;
const DOG_SPEED_MULT = 1.2;
const PET_WANDER_SPEED = 34;
const PET_DRAW_WIDTH = 72;
const PET_SHEET_URL = "./assets/pets-sheet.png";
const COMING_SOON_TREE_URL = "./assets/coming-soon-tree.png";
/** Display height in world pixels (image keeps aspect ratio). */
const COMING_SOON_TREE_DRAW_HEIGHT = 220;
const TRAFFIC_GREEN_URL = "./assets/traffic-green.png";
const TRAFFIC_RED_URL = "./assets/traffic-red.png";
const PET_TRAFFIC_DRAW_W = 44;
const TRAFFIC_ANIM_MS = 210;
const COMPOST_PROCESS_MS = 12000;
const FERTILIZER_RARITIES = ["common", "uncommon", "rare", "legendary", "mythic", "divine", "ultra", "forgotten", "exotic"];
const COMPOST_MACHINE_W = 190;
const COMPOST_MACHINE_H = 160;
const COMPOST_MACHINE_X = DIRT_RIGHT + SHOP_ZONE_W + CLEARING_W / 2 + 120 - COMPOST_MACHINE_W / 2;
const COMPOST_MACHINE_Y = 302;

/** PNG with baked alpha (see scripts/bake_pet_sheet_alpha.py); no canvas getImageData - works on file:// */
let petSheetImage = null;
let petSheetReady = false;
let comingSoonTreeImage = null;
let comingSoonTreeReady = false;
let trafficGreenImg = null;
let trafficGreenReady = false;
let trafficRedImg = null;
let trafficRedReady = false;

function initPetSheet() {
  const im = new Image();
  im.onload = () => {
    if (im.naturalWidth > 0 && im.naturalHeight > 0) {
      petSheetImage = im;
      petSheetReady = true;
    } else {
      petSheetImage = null;
      petSheetReady = false;
    }
  };
  im.onerror = () => {
    petSheetReady = false;
    petSheetImage = null;
  };
  im.src = PET_SHEET_URL;
}

function initComingSoonTree() {
  const im = new Image();
  im.onload = () => {
    if (im.naturalWidth > 0 && im.naturalHeight > 0) {
      comingSoonTreeImage = im;
      comingSoonTreeReady = true;
    } else {
      comingSoonTreeImage = null;
      comingSoonTreeReady = false;
    }
  };
  im.onerror = () => {
    comingSoonTreeReady = false;
    comingSoonTreeImage = null;
  };
  im.src = COMING_SOON_TREE_URL;
}

function initTrafficSheets() {
  const g = new Image();
  g.onload = () => {
    trafficGreenReady = g.naturalWidth > 0 && g.naturalHeight > 0;
    trafficGreenImg = g;
  };
  g.onerror = () => {
    trafficGreenReady = false;
    trafficGreenImg = null;
  };
  g.src = TRAFFIC_GREEN_URL;
  const r = new Image();
  r.onload = () => {
    trafficRedReady = r.naturalWidth > 0 && r.naturalHeight > 0;
    trafficRedImg = r;
  };
  r.onerror = () => {
    trafficRedReady = false;
    trafficRedImg = null;
  };
  r.src = TRAFFIC_RED_URL;
}

function drawTrafficPetSprite(kind, cx, groundY, frameIndex, facingRight, drawWOverride) {
  const img = kind === "trafficGreen" ? trafficGreenImg : trafficRedImg;
  const ready = kind === "trafficGreen" ? trafficGreenReady : trafficRedReady;
  const drawW = drawWOverride ?? PET_TRAFFIC_DRAW_W;
  if (!ready || !img) {
    ctx.fillStyle = kind === "trafficGreen" ? "#2ee85a" : "#e02020";
    ctx.fillRect(Math.round(cx - drawW * 0.22), Math.round(groundY - drawW * 1.1), Math.round(drawW * 0.44), Math.round(drawW * 1.1));
    return;
  }
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const frames = 2;
  const sw = Math.floor(iw / frames);
  const sh = ih;
  const sx = (frameIndex % frames) * sw;
  const drawH = (sh / sw) * drawW;
  const left = cx - drawW / 2;
  const top = groundY - drawH;
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if (!facingRight) {
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    ctx.translate(-cx, 0);
  }
  ctx.drawImage(img, sx, 0, sw, sh, left, top, drawW, drawH);
  ctx.restore();
  ctx.imageSmoothingEnabled = prevSmooth;
}

function petSheetColumnIndex(kind) {
  if (kind === "cat") return 0;
  if (kind === "bunny") return 1;
  return 2;
}

function drawPetSheetSprite(kind, cx, groundY, drawW, facingRight) {
  if (!petSheetReady || !petSheetImage) {
    drawPetPixelSprite(kind, cx, groundY, 2.5);
    return;
  }
  const img = petSheetImage;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) {
    drawPetPixelSprite(kind, cx, groundY, 2.5);
    return;
  }
  const col = petSheetColumnIndex(kind);
  const sliceW = iw / 3;
  const pad = Math.min(3, Math.floor(sliceW * 0.04));
  const sx = col * sliceW + pad;
  const sw = sliceW - pad * 2;
  const aspect = ih / sw;
  const drawH = drawW * aspect;
  const left = cx - drawW / 2;
  const top = groundY - drawH;
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if (!facingRight) {
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    ctx.translate(-cx, 0);
  }
  ctx.drawImage(img, sx, 0, sw, ih, left, top, drawW, drawH);
  ctx.restore();
  ctx.imageSmoothingEnabled = prevSmooth;
}

function assignPetWanderTarget(pet) {
  pet.moveTargetX = DIRT_X + 32 + Math.random() * (DIRT_WIDTH - 64);
  pet.moveTargetY = 110 + Math.random() * (world.height - 110 - 36);
}

function initPetMovementState(pet) {
  pet.facingRight = Math.random() < 0.5;
  pet.moveTargetX = null;
  assignPetWanderTarget(pet);
  if (pet.kind === "trafficGreen" || pet.kind === "trafficRed") {
    pet.trafficFrame = 0;
    pet.trafficAnimT = now();
  }
}

function updatePetMovement(dtMs) {
  const dt = Math.max(0, Math.min(0.05, dtMs / 1000));
  const step = PET_WANDER_SPEED * dt;
  const t = now();
  for (const pet of pets) {
    if (pet.kind === "cat" && pet.catNapUntil && t <= pet.catNapUntil) {
      if (pet.catNapX != null && pet.catNapY != null) {
        pet.x = pet.catNapX;
        pet.y = pet.catNapY;
      }
      continue;
    }
    if (pet.moveTargetX == null || pet.moveTargetY == null) assignPetWanderTarget(pet);
    let { moveTargetX: tx, moveTargetY: ty } = pet;
    let dx = tx - pet.x;
    let dy = ty - pet.y;
    let dist = Math.hypot(dx, dy);
    if (dist < 12) {
      assignPetWanderTarget(pet);
      tx = pet.moveTargetX;
      ty = pet.moveTargetY;
      dx = tx - pet.x;
      dy = ty - pet.y;
      dist = Math.hypot(dx, dy);
    }
    if (pet.kind === "trafficGreen" || pet.kind === "trafficRed") {
      if (pet.trafficAnimT == null) pet.trafficAnimT = t;
      if (pet.trafficFrame == null) pet.trafficFrame = 0;
      if (t - pet.trafficAnimT >= TRAFFIC_ANIM_MS) {
        pet.trafficAnimT = t;
        pet.trafficFrame = (pet.trafficFrame + 1) % 2;
      }
    }
    if (dist < 0.5) continue;
    const mx = (dx / dist) * step;
    const my = (dy / dist) * step;
    pet.x += mx;
    pet.y += my;
    pet.x = clamp(pet.x, DIRT_X + 20, DIRT_RIGHT - 20);
    pet.y = clamp(pet.y, 104, world.height - 22);
    if (Math.abs(dx) > 0.5) pet.facingRight = dx > 0;
  }
}

const stands = [
  {
    type: "buyGear",
    x: 20,
    y: 148,
    w: 210,
    h: 165,
    stripeA: "#5c4d42",
    stripeB: "#e8dcc8",
    text: "GEAR",
    textColor: "#1e1810",
    menuTitle: "Gear Shop",
    menuDesc: "Shovel: $1000. More uses will be added later.",
  },
  {
    type: "buyPet",
    x: 20,
    y: 338,
    w: 210,
    h: 165,
    stripeA: "#b85a9c",
    stripeB: "#fff6fb",
    text: "PETS",
    textColor: "#4a0f3a",
    menuTitle: "Pet Shop",
    menuDesc: "Common Egg: $5000. Hatch it on empty dirt to get a random pet.",
  },
  {
    type: "sell",
    x: DIRT_RIGHT + 20,
    y: 148,
    w: 210,
    h: 165,
    stripeA: "#da3434",
    stripeB: "#ffffff",
    text: "SELL",
    textColor: "#7a1010",
    menuTitle: "Sell Stand",
    menuDesc: "Sell carrots, mint, tomatoes, roses, and other goods for cash.",
  },
  {
    type: "buy",
    x: DIRT_RIGHT + 20,
    y: 338,
    w: 210,
    h: 165,
    stripeA: "#2e67e6",
    stripeB: "#ffffff",
    text: "BUY",
    textColor: "#12367d",
    menuTitle: "Buy Stand",
    menuDesc:
      "Carrot seed $5, mint seed $70, tomato seed $500, rose bush seed $4000. Left-click buys 1; right-click to choose quantity.",
  },
  {
    type: "compost",
    x: COMPOST_MACHINE_X,
    y: COMPOST_MACHINE_Y,
    w: COMPOST_MACHINE_W,
    h: COMPOST_MACHINE_H,
    stripeA: "#6f5432",
    stripeB: "#8d6c45",
    text: "COMPOST",
    textColor: "#f6ecd9",
    menuTitle: "Compost Machine",
    menuDesc:
      "Deposit crops and wait for processing. Fertilizer rarities: common, uncommon, rare, legendary, mythic, divine, ultra, forgotten, exotic. Current best available: rare fertilizer (requires 3 roses).",
  },
];

const WORLD_WIDTH = DIRT_RIGHT + SHOP_ZONE_W + CLEARING_W;
const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 600;
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;
const world = { width: WORLD_WIDTH, height: VIEW_HEIGHT };
const camera = { x: 0, y: 0 };
let cameraMode = "follow";

const PLANT_GROW_MS = 5000;
const MINT_GROW_MS = 15000;
const TOMATO_SEED_STAGE_MS = 2000;
const TOMATO_GROW_MS = 40000;
const TOMATO_REGROW_MS = 50000;
const TOMATO_PIXEL = 3;
const ROSE_BUSH_GROW_MS = 120000;
const ROSE_FRUIT_DELAY_MS = 10000;
const ROSE_REGROW_MS = 60000;
const ROSE_BODY_KG = 0.2;
const ROSE_KG_MIN = 0.08;
const ROSE_KG_MAX = 0.3;
const PLANT_GRID = 30;
const plants = [];
const pets = [];
const compostState = {
  processing: false,
  readyAt: 0,
  pendingRarity: null,
};

const redeemedCodes = new Set();
let lastAutoSaveAt = 0;

function rollPetFromEgg() {
  const r = Math.random();
  if (r < 0.33) return "petDog";
  if (r < 0.66) return "petBunny";
  return "petCat";
}

function getCatNapGrowthBonusMs(plant) {
  const t = now();
  for (const pet of pets) {
    if (pet.kind !== "cat" || !pet.catNapUntil || t > pet.catNapUntil) continue;
    const cx = pet.catNapX != null ? pet.catNapX : pet.x;
    const cy = pet.catNapY != null ? pet.catNapY : pet.y;
    if (Math.hypot(plant.x - cx, plant.y - cy) <= CAT_NAP_RADIUS) return CAT_NAP_GROWTH_BONUS_MS;
  }
  return 0;
}

function plantEffectiveNow(plant) {
  return now() + getCatNapGrowthBonusMs(plant);
}

function hasPetAt(x, y, minDist = 18) {
  return pets.some((pet) => Math.hypot(pet.x - x, pet.y - y) < minDist);
}

function hasOccupiedAt(x, y) {
  return hasPlantAt(x, y) || hasPetAt(x, y);
}

function screenToWorld(mx, my) {
  return { x: mx + camera.x, y: my + camera.y };
}

/** Feet at pet.y; sprite draws upward ~this tall (matches typical sheet aspect). */
const PET_HIT_HALF_W = PET_DRAW_WIDTH * 0.58;
const PET_HIT_TOP_ABOVE_FEET = PET_DRAW_WIDTH * 1.5;
const PET_HIT_FEET_BELOW = 10;

function findPetAtScreen(mouseX, mouseY) {
  const { x: wx, y: wy } = screenToWorld(mouseX, mouseY);
  let best = null;
  let bestD = Infinity;
  for (const pet of pets) {
    const top = pet.y - PET_HIT_TOP_ABOVE_FEET;
    const bot = pet.y + PET_HIT_FEET_BELOW;
    if (wy < top || wy > bot) continue;
    const dx = Math.abs(wx - pet.x);
    if (dx > PET_HIT_HALF_W) continue;
    const midY = pet.y - PET_HIT_TOP_ABOVE_FEET * 0.48;
    const d = Math.hypot(wx - pet.x, wy - midY);
    if (d < bestD) {
      best = pet;
      bestD = d;
    }
  }
  return best;
}

function petKindToInventoryId(kind) {
  if (kind === "dog") return "petDog";
  if (kind === "bunny") return "petBunny";
  if (kind === "cat") return "petCat";
  if (kind === "trafficGreen") return "petTrafficGreen";
  if (kind === "trafficRed") return "petTrafficRed";
  return "petCat";
}

function getPetDescription(kind) {
  if (kind === "dog") {
    return "Dog: While any dog is in your garden, you move about 20% faster.";
  }
  if (kind === "bunny") {
    return "Bunny: Every 2 minutes it eats a random carrot and pays you 120% of that carrot's sell value.";
  }
  if (kind === "cat") {
    return "Cat: Every 2 minutes, 50% chance to nap for 20 seconds. Nearby plants grow faster during the nap bonus.";
  }
  if (kind === "trafficGreen") {
    return "Green Guy [Legendary]: Every 2 minutes applies Go!!! to a random plant (green glow, effect mutation: 2× base added to value after gold). Roams your garden.";
  }
  if (kind === "trafficRed") {
    return "Red Guy [Legendary]: Every 2 minutes applies Stop!!! to a random plant (red glow, same value rule as Go!!!). If a plant has both, they merge into Traffic 🚥. Roams your garden.";
  }
  return "";
}

let petPanelTarget = null;
let lastPetPanelOpenAt = 0;
const petMutationFeedEntries = [];
const PET_MUTATION_FEED_MAX = 9;

function formatCooldown(ms) {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getPetAbilityStatusText(pet) {
  const t = now();
  if (!pet) return null;
  if (pet.kind === "dog") return null;
  if (pet.kind === "bunny") {
    const due = pet.nextCarrotEatAt ?? t;
    return `Special ability (eat carrot) ready in ${formatCooldown(Math.max(0, due - t))}`;
  }
  if (pet.kind === "cat") {
    const due = pet.nextCatRollAt ?? t;
    return `Special ability (cat nap roll) ready in ${formatCooldown(Math.max(0, due - t))}`;
  }
  if (pet.kind === "trafficGreen" || pet.kind === "trafficRed") {
    const due = pet.nextEffectMutationAt ?? t;
    return `Special ability (mutation) ready in ${formatCooldown(Math.max(0, due - t))}`;
  }
  return null;
}

function updatePetPanelTimer() {
  if (!petPanelTimer) return;
  if (!gameState.petPanelOpen || !petPanelTarget || !pets.includes(petPanelTarget)) {
    petPanelTimer.classList.add("hidden");
    petPanelTimer.textContent = "";
    return;
  }
  const text = getPetAbilityStatusText(petPanelTarget);
  if (!text) {
    petPanelTimer.classList.add("hidden");
    petPanelTimer.textContent = "";
    return;
  }
  petPanelTimer.textContent = text;
  petPanelTimer.classList.remove("hidden");
}

function renderPetMutationFeed() {
  if (!petMutationFeedList) return;
  petMutationFeedList.innerHTML = "";
  for (let i = petMutationFeedEntries.length - 1; i >= 0; i -= 1) {
    const row = petMutationFeedEntries[i];
    const el = document.createElement("div");
    el.className = "pet-mutation-feed-item";
    el.textContent = row;
    petMutationFeedList.appendChild(el);
  }
}

function mutationDisplayName(mutationCode) {
  if (mutationCode === "go") return "Go!";
  if (mutationCode === "stop") return "Stop!";
  if (mutationCode === "traffic") return "Traffic";
  return mutationCode;
}

function pushPetMutationFeedMessage(petName, mutationCode, plantType) {
  const plantLabel = plantType === "tomato" ? "tomato" : plantType === "rose" ? "rose" : plantType === "mint" ? "mint" : "carrot";
  petMutationFeedEntries.push(`${petName} applied ${mutationDisplayName(mutationCode)} to your ${plantLabel} plant.`);
  if (petMutationFeedEntries.length > PET_MUTATION_FEED_MAX) {
    petMutationFeedEntries.splice(0, petMutationFeedEntries.length - PET_MUTATION_FEED_MAX);
  }
  renderPetMutationFeed();
}

function closePetPanel() {
  petPanelTarget = null;
  gameState.petPanelOpen = false;
  updatePetPanelTimer();
  if (petPanelOverlay) {
    petPanelOverlay.classList.add("hidden");
    petPanelOverlay.setAttribute("aria-hidden", "true");
  }
}

function openPetPanel(pet) {
  if (!petPanelOverlay || !petPanelTitle || !petPanelDesc) return;
  const t = now();
  if (t - lastPetPanelOpenAt < 220) return;
  lastPetPanelOpenAt = t;
  closeMenu();
  petPanelTarget = pet;
  gameState.petPanelOpen = true;
  const itemId = petKindToInventoryId(pet.kind);
  petPanelTitle.textContent = items[itemId].name;
  petPanelDesc.textContent = getPetDescription(pet.kind);
  updatePetPanelTimer();
  petPanelOverlay.classList.remove("hidden");
  petPanelOverlay.setAttribute("aria-hidden", "false");
}

function tryPetRightClickInfo(event, mouseX, mouseY) {
  if (gameState.prereleaseOverlayOpen) return false;
  if (pickHotbarSlotFromPoint(mouseX, mouseY) !== -1) return false;
  if (gameState.openMenuType || gameState.inventoryOpen) return false;
  const petHit = findPetAtScreen(mouseX, mouseY);
  if (!petHit) return false;
  event.preventDefault();
  openPetPanel(petHit);
  return true;
}

function pickUpPetFromPanel() {
  if (!petPanelTarget || !pets.includes(petPanelTarget)) {
    closePetPanel();
    return;
  }
  const itemId = petKindToInventoryId(petPanelTarget.kind);
  if (!addItem(itemId, 1)) {
    showMessage("Inventory full. Cannot pick up pet.");
    return;
  }
  const idx = pets.indexOf(petPanelTarget);
  if (idx !== -1) pets.splice(idx, 1);
  saveProgress();
  showMessage(
    `${items[itemId].name} picked up. Select it in the hotbar and press E on empty dirt to release it.`
  );
  closePetPanel();
}

function getDogSpeedMultiplier() {
  return pets.some((p) => p.kind === "dog") ? DOG_SPEED_MULT : 1;
}

function updatePetBehaviors() {
  const t = now();
  for (const pet of pets) {
    if (pet.kind === "bunny") {
      if (pet.nextCarrotEatAt == null) pet.nextCarrotEatAt = t + BUNNY_EAT_INTERVAL_MS;
      if (t >= pet.nextCarrotEatAt) {
        pet.nextCarrotEatAt = t + BUNNY_EAT_INTERVAL_MS;
        const carrots = plants.filter((p) => p.type === "carrot");
        if (carrots.length === 0) continue;
        const c = carrots[Math.floor(Math.random() * carrots.length)];
        const w = clamp(Number(c.weightKg) || 1.09, 0.3, 2.3);
        const mul = getCarrotValueMultiplier(w);
        const baseNat = Math.max(1, Math.round(items.carrot.sellPrice * mul));
        const m = harvestMutationMetaFromPlant(c);
        const value = applyCropEffectMutationsToValue(baseNat, m || {});
        const payout = Math.round(value * 1.2);
        gameState.money += payout;
        const idx = plants.indexOf(c);
        if (idx !== -1) plants.splice(idx, 1);
        showMessage(`Bunny ate a carrot! +$${payout} (120% sell value).`);
        saveProgress();
      }
    } else if (pet.kind === "cat") {
      if (pet.nextCatRollAt == null) pet.nextCatRollAt = t + CAT_TICK_INTERVAL_MS;
      if (t >= pet.nextCatRollAt) {
        pet.nextCatRollAt = t + CAT_TICK_INTERVAL_MS;
        if (Math.random() < 0.5) {
          pet.catNapX = clamp(DIRT_X + 48 + Math.random() * (DIRT_WIDTH - 96), DIRT_X + 24, DIRT_RIGHT - 24);
          pet.catNapY = clamp(118 + Math.random() * (world.height - 150), 110, world.height - 24);
          pet.catNapUntil = t + CAT_NAP_GROWTH_BONUS_MS;
          pet.x = pet.catNapX;
          pet.y = pet.catNapY;
        } else {
          pet.catNapUntil = 0;
        }
      }
    } else if (pet.kind === "trafficGreen") {
      if (pet.nextEffectMutationAt == null) pet.nextEffectMutationAt = t + TRAFFIC_PET_MUTATION_INTERVAL_MS;
      if (t >= pet.nextEffectMutationAt) {
        pet.nextEffectMutationAt = t + TRAFFIC_PET_MUTATION_INTERVAL_MS;
        if (plants.length > 0) {
          const applied = applyPetEffectMutationToRandomPlant("go");
          if (applied && applied.plant) {
            pushPetMutationFeedMessage(items.petTrafficGreen.name, applied.mutation, applied.plant.type);
            showMessage(`Green Guy applied ${mutationDisplayName(applied.mutation)}.`);
          }
        }
      }
    } else if (pet.kind === "trafficRed") {
      if (pet.nextEffectMutationAt == null) pet.nextEffectMutationAt = t + TRAFFIC_PET_MUTATION_INTERVAL_MS;
      if (t >= pet.nextEffectMutationAt) {
        pet.nextEffectMutationAt = t + TRAFFIC_PET_MUTATION_INTERVAL_MS;
        if (plants.length > 0) {
          const applied = applyPetEffectMutationToRandomPlant("stop");
          if (applied && applied.plant) {
            pushPetMutationFeedMessage(items.petTrafficRed.name, applied.mutation, applied.plant.type);
            showMessage(`Red Guy applied ${mutationDisplayName(applied.mutation)}.`);
          }
        }
      }
    }
  }
}

function drawPetPixelSprite(kind, cx, groundY, pixelScale) {
  const S = pixelScale;
  const R = (rx, ry, rw, rh, c) => {
    if (rw <= 0 || rh <= 0) return;
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(cx + rx * S), Math.round(groundY - (ry + rh) * S), Math.ceil(rw * S), Math.ceil(rh * S));
  };

  if (kind === "cat") {
    const O = "#ea8f42";
    const D = "#c96a1a";
    const W = "#f2ebe4";
    const Pk = "#e8a8a6";
    const Bl = "#1a1814";
    R(-10, 0, 2, 2, W);
    R(-5, 0, 2, 2, W);
    R(1, 0, 2, 2, W);
    R(6, 0, 2, 2, W);
    R(-11, 2, 3, 2, O);
    R(-8, 2, 3, 2, D);
    R(-4, 2, 5, 2, O);
    R(2, 2, 5, 2, O);
    R(8, 2, 3, 2, O);
    R(-9, 4, 2, 2, D);
    R(-6, 4, 11, 3, O);
    R(6, 4, 2, 1, D);
    R(-3, 5, 5, 3, W);
    R(3, 5, 5, 3, O);
    R(-10, 7, 14, 4, O);
    R(-7, 7, 2, 2, D);
    R(-2, 7, 3, 1, D);
    R(3, 7, 2, 2, D);
    R(-9, 11, 12, 4, O);
    R(-5, 11, 2, 2, D);
    R(1, 11, 2, 2, D);
    R(6, 9, 8, 6, O);
    R(7, 8, 3, 2, Pk);
    R(11, 8, 3, 2, Pk);
    R(12, 10, 4, 3, O);
    R(14, 11, 2, 2, O);
    R(15, 10, 2, 2, O);
    R(13, 12, 1, 1, Bl);
    R(10, 13, 4, 1, W);
    R(11, 14, 3, 1, W);
    R(12, 15, 2, 1, W);
    R(-12, 10, 3, 3, O);
    R(-13, 13, 2, 2, O);
    R(-14, 15, 2, 2, O);
    R(-15, 17, 2, 3, O);
    R(-14, 19, 2, 2, W);
    R(-11, 14, 2, 8, O);
    R(-10, 12, 1, 3, D);
    return;
  }

  if (kind === "bunny") {
    const F = "#a89888";
    const L = "#8a7a6e";
    const B = "#e8dfd4";
    const E = "#e8b0a8";
    const Ey = "#2a2420";
    const N = "#d89890";
    R(0, 14, 2, 7, F);
    R(2, 14, 2, 7, F);
    R(0, 13, 2, 2, E);
    R(2, 13, 2, 2, E);
    R(0, 20, 2, 2, E);
    R(2, 20, 2, 2, E);
    R(-1, 0, 3, 2, F);
    R(2, 0, 3, 2, F);
    R(-4, 2, 10, 5, F);
    R(-2, 3, 5, 3, B);
    R(2, 5, 5, 4, F);
    R(4, 4, 4, 4, F);
    R(7, 5, 5, 5, F);
    R(10, 7, 2, 2, L);
    R(11, 8, 1, 2, Ey);
    R(12, 9, 2, 2, N);
    R(-1, 6, 2, 2, E);
    R(1, 6, 2, 2, E);
    R(-3, 5, 2, 2, B);
    R(-5, 6, 2, 2, "#f2ebe4");
    return;
  }

  if (kind === "dog") {
    const G = "#d4a04a";
    const Hi = "#e8b860";
    const Lo = "#a67c32";
    const Bl = "#1a1814";
    const Tg = "#e07088";
    R(-8, 0, 2, 2, Lo);
    R(-4, 0, 2, 2, Lo);
    R(2, 0, 2, 2, G);
    R(6, 0, 2, 2, G);
    R(-10, 2, 4, 2, Lo);
    R(-5, 2, 14, 3, G);
    R(6, 2, 4, 2, Hi);
    R(-8, 5, 16, 4, G);
    R(-5, 5, 6, 2, Hi);
    R(5, 5, 2, 2, Lo);
    R(-6, 9, 12, 4, G);
    R(2, 8, 8, 5, G);
    R(3, 7, 4, 4, Hi);
    R(4, 6, 3, 3, Lo);
    R(8, 9, 4, 3, G);
    R(10, 10, 3, 2, G);
    R(11, 9, 2, 2, Bl);
    R(12, 10, 2, 2, Bl);
    R(12, 11, 3, 2, Tg);
    R(13, 10, 2, 1, Bl);
    R(-9, 10, 3, 3, G);
    R(-10, 12, 2, 4, G);
    R(-9, 15, 2, 3, Hi);
    R(-8, 17, 2, 2, G);
    return;
  }
}

function drawPet(pet) {
  const px = pet.x;
  const py = pet.y;
  const facing = pet.facingRight !== false;

  if (pet.kind === "trafficGreen" || pet.kind === "trafficRed") {
    const frame = pet.trafficFrame != null ? pet.trafficFrame % 2 : 0;
    drawTrafficPetSprite(pet.kind, px, py, frame, facing);
    return;
  }

  if (pet.kind === "cat") {
    const tn = now();
    if (pet.catNapUntil && tn <= pet.catNapUntil) {
      const nx = pet.catNapX != null ? pet.catNapX : px;
      const ny = pet.catNapY != null ? pet.catNapY : py;
      ctx.fillStyle = "rgba(72, 168, 92, 0.28)";
      ctx.beginPath();
      ctx.arc(nx, ny, CAT_NAP_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(34, 110, 52, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(200, 240, 170, 0.55)";
      ctx.font = "11px Arial";
      ctx.textAlign = "center";
      ctx.fillText("z", nx - 10, ny - 20);
      ctx.fillText("z", nx, ny - 28);
      ctx.fillText("z", nx + 10, ny - 36);
    }
  }

  drawPetSheetSprite(pet.kind, px, py, PET_DRAW_WIDTH, facing);
}

function drawPets() {
  pets.forEach(drawPet);
}

const LOADING_SCREEN_MS = 2000;
const LOADING_TIPS = [
  "Mints and roses barely vary in weight.",
  "Right-click a buy button to choose how many you want.",
  "The shovel will dig up plants in a future update.",
  "Stronger crops and new garden tools are planned for future updates.",
];

function now() {
  return Date.now();
}

function showMessage(text, duration = 1600) {
  gameState.message = text;
  gameState.messageUntil = now() + duration;
}

function codeDigitToNumber(ch) {
  if (!ch || typeof ch !== "string") return null;
  const c = ch.toLowerCase();
  if (c === "z") return 0;
  const code = c.charCodeAt(0);
  if (code >= 97 && code <= 105) return code - 96; // a..i => 1..9
  return null;
}

function parseRainbowCode(raw) {
  if (typeof raw !== "string") return { ok: false, error: "Enter a code." };
  const code = raw.trim();
  if (code.length < 5) return { ok: false, error: "Code too short." };
  const c2 = code[1];
  if (!c2 || c2 < "0" || c2 > "9") return { ok: false, error: "Digit 2 must be a number." };
  const d3 = codeDigitToNumber(code[2]);
  if (d3 == null) return { ok: false, error: "Digit 3 must be a..i or z." };
  const fifth = code[4];
  if (!fifth) return { ok: false, error: "Missing digit 5." };
  if (fifth === ".") {
    if (code.length !== 5) return { ok: false, error: "Code must end at digit 5 with '.'." };
    return { ok: true, normalized: code, amount: d3 };
  }
  const d5 = codeDigitToNumber(fifth);
  if (d5 == null) return { ok: false, error: "Digit 5 must be a..i, z, or '.'." };
  const sixth = code[5];
  if (![",", "~", "'", ":"].includes(sixth)) return { ok: false, error: "Digit 6 must be one of , ~ ' :" };
  const seventh = code[6];
  if (!seventh) return { ok: false, error: "Missing digit 7." };
  if (seventh === ".") {
    if (code.length !== 7) return { ok: false, error: "Code must end at digit 7 with '.'." };
    return { ok: true, normalized: code, amount: d3 * 10 + d5 };
  }
  const d7 = codeDigitToNumber(seventh);
  if (d7 == null) return { ok: false, error: "Digit 7 must be a..i, z, or '.'." };
  if (code.length !== 8 || code[7] !== ".") return { ok: false, error: "Digit 8 must be '.' to end the code." };
  return { ok: true, normalized: code, amount: d3 * 100 + d5 * 10 + d7 };
}

function redeemRainbowCode(raw) {
  const parsed = parseRainbowCode(raw);
  if (!parsed.ok) {
    showMessage(parsed.error || "Invalid code.");
    return false;
  }
  const key = parsed.normalized;
  if (redeemedCodes.has(key)) {
    showMessage("Code already redeemed.");
    return false;
  }
  const amt = Math.max(0, Math.floor(Number(parsed.amount) || 0));
  if (amt <= 0) {
    showMessage("Code amount is 0.");
    return false;
  }
  redeemedCodes.add(key);
  gameState.rainbowCoins = Math.max(0, Math.floor(gameState.rainbowCoins + amt));
  saveProgress();
  showMessage(`Redeemed ${amt} rainbow coins.`);
  return true;
}

function encodeSaveString(jsonText) {
  try {
    return btoa(unescape(encodeURIComponent(jsonText)));
  } catch (_e) {
    return null;
  }
}

function decodeSaveString(encoded) {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch (_e) {
    return null;
  }
}

function exportSaveBlob() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (_e) {
    raw = null;
  }
  if (!raw) return null;
  const encoded = encodeSaveString(raw);
  return encoded ? `GSP1:${encoded}` : null;
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_e) {
    // ignore
  }
  return false;
}

async function exportSaveToClipboardOrPrompt() {
  const blob = exportSaveBlob();
  if (!blob) {
    showMessage("No save found to export.");
    return;
  }
  const ok = await copyTextToClipboard(blob);
  if (ok) {
    showMessage("Save exported to clipboard.");
    return;
  }
  window.prompt("Copy this save string:", blob);
}

function getSaveDiagnosticsText() {
  let raw = null;
  let backup = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    backup = localStorage.getItem(`${STORAGE_KEY}_corrupt_backup`);
  } catch (_e) {
    raw = null;
    backup = null;
  }
  const rawLen = raw ? raw.length : 0;
  const backupLen = backup ? backup.length : 0;
  const loc = String(window.location.href || "");
  return `Location: ${loc}\nSave present: ${rawLen > 0 ? "yes" : "no"} (${rawLen} chars)\nCorrupt backup: ${backupLen > 0 ? "yes" : "no"} (${backupLen} chars)\n`;
}

function importSaveFromString(input) {
  if (typeof input !== "string" || input.trim().length < 10) {
    showMessage("Invalid save string.");
    return false;
  }
  const text = input.trim();
  if (!text.startsWith("GSP1:")) {
    showMessage("Invalid save string prefix.");
    return false;
  }
  const decoded = decodeSaveString(text.slice(5));
  if (!decoded) {
    showMessage("Could not decode save string.");
    return false;
  }
  try {
    JSON.parse(decoded);
  } catch (_e) {
    showMessage("Decoded save is not valid JSON.");
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, decoded);
  } catch (_e) {
    showMessage("Could not write save (storage blocked).");
    return false;
  }
  showMessage("Save imported. Reloading...");
  window.setTimeout(() => window.location.reload(), 350);
  return true;
}

function showPrereleaseOverlay() {
  if (!prereleaseOverlay) return;
  gameState.prereleaseOverlayOpen = true;
  keys.up = false;
  keys.down = false;
  keys.left = false;
  keys.right = false;
  prereleaseOverlay.classList.remove("hidden");
  prereleaseOverlay.setAttribute("aria-hidden", "false");
}

function hidePrereleaseOverlay() {
  if (!prereleaseOverlay) return;
  gameState.prereleaseOverlayOpen = false;
  prereleaseOverlay.classList.add("hidden");
  prereleaseOverlay.setAttribute("aria-hidden", "true");
}

function maybeShowPrereleaseOverlay() {
  if (gameState.prereleaseRewardClaimed) return;
  showPrereleaseOverlay();
}

function claimPrereleaseRewards() {
  if (gameState.prereleaseRewardClaimed) return;
  let empty = 0;
  for (let i = 0; i < inventory.length; i += 1) {
    if (!inventory[i]) empty += 1;
  }
  if (empty < 2) {
    showMessage("Need 2 empty inventory slots to claim.");
    return;
  }
  if (!addItem("petTrafficGreen", 1)) {
    showMessage("Inventory full.");
    return;
  }
  if (!addItem("petTrafficRed", 1)) {
    removeItem("petTrafficGreen", 1);
    showMessage("Inventory full.");
    return;
  }
  gameState.prereleaseRewardClaimed = true;
  hidePrereleaseOverlay();
  saveProgress();
  showMessage("Prerelease pets added to your inventory.");
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(num, max));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function toFixedNumber(num, digits = 2) {
  return Number(num.toFixed(digits));
}

function circleIntersectsRect(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function drawDirtTexture(rectX, rectY, rectW, rectH, base, dark, light) {
  ctx.fillStyle = base;
  ctx.fillRect(rectX, rectY, rectW, rectH);
  for (let i = 0; i < 50; i += 1) {
    const px = rectX + ((i * 47) % rectW);
    const py = rectY + ((i * 29) % rectH);
    ctx.fillStyle = i % 2 === 0 ? dark : light;
    ctx.fillRect(px, py, 3, 2);
  }
}

function drawWoodTexture(rectX, rectY, rectW, rectH) {
  ctx.fillStyle = "#8c6642";
  ctx.fillRect(rectX, rectY, rectW, rectH);

  for (let y = rectY; y < rectY + rectH; y += 34) {
    ctx.fillStyle = "rgba(66, 42, 24, 0.35)";
    ctx.fillRect(rectX, y, rectW, 2);
    ctx.fillStyle = "rgba(223, 188, 143, 0.12)";
    ctx.fillRect(rectX, y + 3, rectW, 1);
  }

  for (let i = 0; i < 120; i += 1) {
    const knotX = rectX + ((i * 61) % rectW);
    const knotY = rectY + ((i * 43) % rectH);
    ctx.strokeStyle = "rgba(70, 45, 27, 0.35)";
    ctx.beginPath();
    ctx.ellipse(knotX, knotY, 4, 2, 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawGardenBackground() {
  drawWoodTexture(0, 0, LEFT_COMMERCE_W, world.height);
  drawDirtTexture(DIRT_X, 0, DIRT_WIDTH, world.height, "#775635", "#5f422a", "#8a6640");

  ctx.fillStyle = "rgba(45, 32, 20, 0.35)";
  ctx.fillRect(DIRT_X + WEST_GARDEN_W - 2, 96, 4, world.height - 116);

  drawWoodTexture(DIRT_RIGHT, 0, world.width - DIRT_RIGHT, world.height);

  const shopClearingSplit = DIRT_RIGHT + SHOP_ZONE_W;
  ctx.fillStyle = "rgba(55, 38, 22, 0.45)";
  ctx.fillRect(shopClearingSplit - 2, 0, 4, world.height);

  ctx.fillStyle = "rgba(44, 26, 15, 0.52)";
  ctx.fillRect(DIRT_RIGHT - 2, 0, 4, world.height);

  ctx.fillStyle = "rgba(38, 26, 18, 0.55)";
  ctx.fillRect(LEFT_COMMERCE_W - 2, 0, 4, world.height);
}

/** Placeholder tree in the open wood clearing to the right of Sell/Buy (not the narrow shop strip). */
function drawComingSoonTree() {
  if (!comingSoonTreeReady || !comingSoonTreeImage) return;
  const im = comingSoonTreeImage;
  const iw = im.naturalWidth;
  const ih = im.naturalHeight;
  if (!iw || !ih) return;
  const drawH = COMING_SOON_TREE_DRAW_HEIGHT;
  const drawW = (iw / ih) * drawH;
  const clearingLeft = DIRT_RIGHT + SHOP_ZONE_W;
  const cx = clearingLeft + CLEARING_W / 2;
  const groundY = 380;
  const left = cx - drawW / 2;
  const top = groundY - drawH;
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(im, 0, 0, iw, ih, left, top, drawW, drawH);
  ctx.imageSmoothingEnabled = prevSmooth;

  ctx.save();
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  const label = "Not Ready YET";
  const tx = cx;
  const ty = top - 10;
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillText(label, tx + 2, ty + 2);
  ctx.fillStyle = "#f4ead8";
  ctx.fillText(label, tx, ty);
  ctx.restore();
}

function drawCompostMachine() {
  const x = COMPOST_MACHINE_X;
  const y = COMPOST_MACHINE_Y;
  const w = COMPOST_MACHINE_W;
  const h = COMPOST_MACHINE_H;
  drawWoodTexture(x, y, w, h);
  ctx.strokeStyle = "#4d341f";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  const lidH = 34;
  ctx.fillStyle = "#5b4229";
  ctx.fillRect(x + 10, y + 10, w - 20, lidH);
  ctx.strokeStyle = "#2d1e12";
  ctx.strokeRect(x + 10, y + 10, w - 20, lidH);

  ctx.fillStyle = "rgba(30, 22, 14, 0.45)";
  ctx.fillRect(x + 22, y + 54, w - 44, h - 72);

  ctx.fillStyle = "#d3c5a2";
  ctx.fillRect(x + 26, y - 30, w - 52, 24);
  ctx.strokeStyle = "#4d3a20";
  ctx.strokeRect(x + 26, y - 30, w - 52, 24);
  ctx.fillStyle = "#3f2a16";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("COMPOST MACHINE", x + w / 2, y - 18);

  const t = now();
  let status = "Ready";
  if (compostState.processing && compostState.readyAt > t) {
    const sec = Math.max(1, Math.ceil((compostState.readyAt - t) / 1000));
    status = `Working ${sec}s`;
  } else if (compostState.processing && compostState.pendingRarity) {
    status = "Collect";
  }
  ctx.fillStyle = "#f2ead6";
  ctx.fillRect(x + 36, y + h - 28, w - 72, 18);
  ctx.fillStyle = "#332212";
  ctx.font = "bold 12px Arial";
  ctx.fillText(status, x + w / 2, y + h - 19);
}

function getCarrotValueMultiplier(weightKg) {
  const minW = 0.3;
  const midW = 1.09;
  const maxW = 2.3;
  const minMul = 1 / 3;
  const midMul = 1;
  const maxMul = 2.9;
  const w = clamp(weightKg, minW, maxW);
  if (w <= midW) {
    return lerp(minMul, midMul, (w - minW) / (midW - minW));
  }
  return lerp(midMul, maxMul, (w - midW) / (maxW - midW));
}

function mutationMetaKey(meta) {
  if (!meta) return "";
  const parts = [];
  if (meta.mutGold) parts.push("G");
  if (meta.mutTraffic) parts.push("T");
  if (meta.mutGo) parts.push("Go");
  if (meta.mutStop) parts.push("S");
  return parts.join("");
}

function sanitizeMutationMeta(meta) {
  if (!meta) return {};
  const out = {};
  if (meta.mutGold) out.mutGold = true;
  if (meta.mutTraffic) {
    out.mutTraffic = true;
  } else {
    if (meta.mutGo) out.mutGo = true;
    if (meta.mutStop) out.mutStop = true;
    if (out.mutGo && out.mutStop) {
      delete out.mutGo;
      delete out.mutStop;
      out.mutTraffic = true;
    }
  }
  return out;
}

function rollGoldMutationMeta() {
  return Math.random() < GOLD_MUTATION_CHANCE ? { mutGold: true } : {};
}

function getTomatoActiveSlotIndices(plant) {
  const n = Math.min(plant.tomatoesRemaining ?? 0, 3);
  const out = [];
  for (let i = 3 - n; i < 3; i += 1) out.push(i);
  return out;
}

function getRoseActiveSlotIndices(plant) {
  const n = Math.min(plant.rosesRemaining ?? 0, 2);
  const out = [];
  for (let i = 2 - n; i < 2; i += 1) out.push(i);
  return out;
}

function refillTomatoMutationSlotsIfNeeded(plant) {
  if (!Array.isArray(plant.tomatoMutationSlots)) plant.tomatoMutationSlots = [];
  while (plant.tomatoMutationSlots.length < 3) {
    plant.tomatoMutationSlots.push(rollGoldMutationMeta());
  }
  plant.tomatoMutationSlots.length = 3;
  for (let i = 0; i < 3; i += 1) {
    plant.tomatoMutationSlots[i] = sanitizeMutationMeta(plant.tomatoMutationSlots[i]);
  }
}

function refillRoseMutationSlotsIfNeeded(plant) {
  if (!Array.isArray(plant.roseMutationSlots)) plant.roseMutationSlots = [];
  while (plant.roseMutationSlots.length < 2) {
    plant.roseMutationSlots.push(rollGoldMutationMeta());
  }
  plant.roseMutationSlots.length = 2;
  for (let i = 0; i < 2; i += 1) {
    plant.roseMutationSlots[i] = sanitizeMutationMeta(plant.roseMutationSlots[i]);
  }
}

function getHarvestMutationMetaFromPlantSlot(plant, slotIndex) {
  if (plant.type === "tomato") {
    const row = plant.tomatoMutationSlots?.[slotIndex];
    const m = sanitizeMutationMeta(row);
    return Object.keys(m).length ? m : null;
  }
  if (plant.type === "rose") {
    const row = plant.roseMutationSlots?.[slotIndex];
    const m = sanitizeMutationMeta(row);
    return Object.keys(m).length ? m : null;
  }
  return harvestMutationMetaFromPlant(plant);
}

function getCropBaseNaturalSellRounded(itemId, meta) {
  const itemDef = items[itemId];
  if (!itemDef || !Number.isFinite(itemDef.sellPrice)) return 0;
  if (itemId === "carrot") {
    const weightKg = clamp(Number(meta?.weightKg) || 1.09, 0.3, 2.3);
    return Math.max(1, Math.round(itemDef.sellPrice * getCarrotValueMultiplier(weightKg)));
  }
  if (itemId === "tomato") {
    const weightKg = clamp(Number(meta?.weightKg) || 0.7, 0.3, 8);
    return Math.max(1, Math.round(itemDef.sellPrice * (weightKg / 0.7)));
  }
  if (itemId === "rose") {
    const weightKg = clamp(Number(meta?.weightKg) || ROSE_BODY_KG, ROSE_KG_MIN, ROSE_KG_MAX);
    return Math.max(1, Math.round(itemDef.sellPrice * (weightKg / ROSE_BODY_KG)));
  }
  return Math.max(1, Math.round(itemDef.sellPrice));
}

/** Effect mutations: final = baseNat * M + value_after_gold; traffic merges Go+Stop into one step. */
function applyCropEffectMutationsToValue(baseNat, meta) {
  if (!meta) return Math.max(1, Math.round(baseNat));
  const mm = sanitizeMutationMeta(meta);
  const gold = !!mm.mutGold;
  const traffic = !!mm.mutTraffic;
  const go = !!mm.mutGo;
  const stop = !!mm.mutStop;
  let afterGold = gold ? baseNat * GOLD_MUTATION_MULT : baseNat;
  afterGold = Math.round(afterGold);
  if (traffic) {
    const m = EFFECT_MUTATION_MULT;
    return Math.max(1, Math.round(baseNat * m + (baseNat * m + afterGold)));
  }
  let v = afterGold;
  if (go) v = Math.max(1, Math.round(baseNat * EFFECT_MUTATION_MULT + afterGold));
  if (stop) v = Math.max(1, Math.round(baseNat * EFFECT_MUTATION_MULT + v));
  return v;
}

function getPlantBaseNaturalSellRounded(plant) {
  if (plant.type === "carrot") {
    const w = clamp(Number(plant.weightKg) || 1.09, 0.3, 2.3);
    return Math.max(1, Math.round(items.carrot.sellPrice * getCarrotValueMultiplier(w)));
  }
  if (plant.type === "mint") return Math.max(1, items.mint.sellPrice);
  if (plant.type === "tomato") return Math.max(1, items.tomato.sellPrice);
  if (plant.type === "rose") return Math.max(1, items.rose.sellPrice);
  return 1;
}

function getPlantMutatedSellValue(plant) {
  const baseNat = getPlantBaseNaturalSellRounded(plant);
  const meta = harvestMutationMetaFromPlant(plant);
  return applyCropEffectMutationsToValue(baseNat, meta || {});
}

function harvestMutationMetaFromPlant(plant) {
  const m = sanitizeMutationMeta(plant);
  return Object.keys(m).length ? m : null;
}

function syncGoldMutationRollForPlant(plant) {
  if (plant.type === "tomato") {
    syncTomatoPlant(plant);
    if ((plant.tomatoesRemaining ?? 0) > 0) refillTomatoMutationSlotsIfNeeded(plant);
    return;
  }
  if (plant.type === "rose") {
    syncRosePlant(plant);
    if ((plant.rosesRemaining ?? 0) > 0) refillRoseMutationSlotsIfNeeded(plant);
    return;
  }
  if (plant.goldMutationRolled) return;
  const te = plantEffectiveNow(plant) - plant.plantedAt;
  let eligible = false;
  if (plant.type === "carrot") {
    eligible = te >= PLANT_GROW_MS;
  } else if (plant.type === "mint") {
    eligible = te >= MINT_GROW_MS;
  }
  if (!eligible) return;
  plant.goldMutationRolled = true;
  if (Math.random() < GOLD_MUTATION_CHANCE) plant.mutGold = true;
}

function syncAllPlantGoldRolls() {
  for (const p of plants) syncGoldMutationRollForPlant(p);
}

function applyPetEffectMutationToRandomPlant(effect) {
  if (plants.length === 0) return;
  const candidates = [];
  for (const p of plants) {
    if (p.type === "tomato") {
      const idxs = getTomatoActiveSlotIndices(p);
      for (const idx of idxs) {
        const m = sanitizeMutationMeta(p.tomatoMutationSlots?.[idx]);
        if (m.mutTraffic) continue;
        if (effect === "go" && m.mutGo) continue;
        if (effect === "stop" && m.mutStop) continue;
        candidates.push({ plant: p, slotIndex: idx });
      }
      continue;
    }
    if (p.type === "rose") {
      const idxs = getRoseActiveSlotIndices(p);
      for (const idx of idxs) {
        const m = sanitizeMutationMeta(p.roseMutationSlots?.[idx]);
        if (m.mutTraffic) continue;
        if (effect === "go" && m.mutGo) continue;
        if (effect === "stop" && m.mutStop) continue;
        candidates.push({ plant: p, slotIndex: idx });
      }
      continue;
    }
    const m = sanitizeMutationMeta(p);
    if (m.mutTraffic) continue;
    if (effect === "go" && m.mutGo) continue;
    if (effect === "stop" && m.mutStop) continue;
    candidates.push({ plant: p, slotIndex: null });
  }
  if (candidates.length === 0) return;
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const p = target.plant;
  let m = getHarvestMutationMetaFromPlantSlot(p, target.slotIndex) || {};
  m = sanitizeMutationMeta(m);
  let appliedMutation = effect;
  if (effect === "go") m.mutGo = true;
  if (effect === "stop") m.mutStop = true;
  m = sanitizeMutationMeta(m);
  if (m.mutTraffic) appliedMutation = "traffic";
  if (p.type === "tomato" && target.slotIndex != null) {
    if (!Array.isArray(p.tomatoMutationSlots)) p.tomatoMutationSlots = [{}, {}, {}];
    p.tomatoMutationSlots[target.slotIndex] = m;
  } else if (p.type === "rose" && target.slotIndex != null) {
    if (!Array.isArray(p.roseMutationSlots)) p.roseMutationSlots = [{}, {}];
    p.roseMutationSlots[target.slotIndex] = m;
  } else {
    p.mutGold = !!m.mutGold;
    p.mutGo = !!m.mutGo;
    p.mutStop = !!m.mutStop;
    p.mutTraffic = !!m.mutTraffic;
  }
  return { plant: p, mutation: appliedMutation };
}

function drawPlantMutationOverlays(plant) {
  let state = sanitizeMutationMeta(plant);
  if (plant.type === "tomato") {
    state = {};
    for (const idx of getTomatoActiveSlotIndices(plant)) {
      const m = sanitizeMutationMeta(plant.tomatoMutationSlots?.[idx]);
      if (m.mutTraffic) {
        state.mutTraffic = true;
        state.mutGo = false;
        state.mutStop = false;
        break;
      }
      if (m.mutGo) state.mutGo = true;
      if (m.mutStop) state.mutStop = true;
    }
  } else if (plant.type === "rose") {
    state = {};
    for (const idx of getRoseActiveSlotIndices(plant)) {
      const m = sanitizeMutationMeta(plant.roseMutationSlots?.[idx]);
      if (m.mutTraffic) {
        state.mutTraffic = true;
        state.mutGo = false;
        state.mutStop = false;
        break;
      }
      if (m.mutGo) state.mutGo = true;
      if (m.mutStop) state.mutStop = true;
    }
  }
  const px = plant.x;
  const gy = plant.y;
  if (state.mutGo && !state.mutTraffic) {
    const g = ctx.createRadialGradient(px, gy - 14, 2, px, gy - 14, 14);
    g.addColorStop(0, "rgba(80, 255, 120, 0.5)");
    g.addColorStop(1, "rgba(80, 255, 120, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, gy - 14, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  if (state.mutStop && !state.mutTraffic) {
    const g = ctx.createRadialGradient(px, gy - 14, 2, px, gy - 14, 14);
    g.addColorStop(0, "rgba(255, 80, 80, 0.5)");
    g.addColorStop(1, "rgba(255, 80, 80, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, gy - 14, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  if (state.mutTraffic) {
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🚥", px, gy - 36);
  }
}

function getCarrotVisualScale(weightKg) {
  const minW = 0.3;
  const maxW = 2.3;
  const minScale = 0.7;
  const maxScale = 2;
  const w = clamp(weightKg, minW, maxW);
  return lerp(minScale, maxScale, (w - minW) / (maxW - minW));
}

function rollCarrotWeight() {
  const table = [
    { weight: 1.09, chance: 0.4 },
    { weight: 0.3, chance: 1 / 756 },
    { weight: 0.4, chance: 0.02 },
    { weight: 0.5, chance: 1 / 20 },
    { weight: 0.7, chance: 0.12 },
    { weight: 0.9, chance: 0.11 },
    { weight: 1.3, chance: 0.14 },
    { weight: 1.5, chance: 0.08 },
    { weight: 1.8, chance: 0.05 },
    { weight: 2.1, chance: 0.025 },
    { weight: 2.2, chance: 0.052356 },
    { weight: 2.3, chance: 1 / 756 },
  ];
  const r = Math.random();
  let cursor = 0;
  for (const entry of table) {
    cursor += entry.chance;
    if (r <= cursor) return entry.weight;
  }
  return 1.09;
}

const TOMATO_WEIGHT_SIGMA = 0.55;
const TOMATO_BODY_WEIGHTS = [
  0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.1, 1.2, 1.35, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75,
  2.9, 3.1, 3.2, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5,
];

let tomatoBodyCdf = null;

function getTomatoBodyCdf() {
  if (tomatoBodyCdf) return tomatoBodyCdf;
  const sigma = TOMATO_WEIGHT_SIGMA;
  const scores = TOMATO_BODY_WEIGHTS.map((w) => Math.exp(-((w - 0.7) ** 2) / (2 * sigma * sigma)));
  const sum = scores.reduce((a, b) => a + b, 0);
  const weights = scores.map((s) => s / sum);
  const cdf = [];
  let acc = 0;
  for (let i = 0; i < TOMATO_BODY_WEIGHTS.length; i += 1) {
    acc += weights[i];
    cdf.push({ w: TOMATO_BODY_WEIGHTS[i], t: acc });
  }
  tomatoBodyCdf = cdf;
  return tomatoBodyCdf;
}

function sampleTomatoBodyWeight(u) {
  const cdf = getTomatoBodyCdf();
  const t = Math.min(1, Math.max(0, u));
  for (const step of cdf) {
    if (t <= step.t) return step.w;
  }
  return TOMATO_BODY_WEIGHTS[TOMATO_BODY_WEIGHTS.length - 1];
}

function rollTomatoWeightKg() {
  const pMin = 1 / 752;
  const p8 = 1 / 2000;
  const p3 = 1 / 70;
  const r = Math.random();
  if (r < pMin) return 0.3;
  if (r < pMin + p8) return 8;
  if (r < pMin + p8 + p3) return 3;
  const u = (r - pMin - p8 - p3) / (1 - pMin - p8 - p3);
  return sampleTomatoBodyWeight(u);
}

function rollRoseWeightKg() {
  const w = ROSE_BODY_KG + (Math.random() - 0.5) * 0.06 + (Math.random() - 0.5) * 0.06;
  return clamp(w, ROSE_KG_MIN, ROSE_KG_MAX);
}

function getTomatoFruitDiameterPx(weightKg) {
  const w = clamp(Number(weightKg) || 0.7, 0.3, 8);
  const t = (w - 0.3) / (8 - 0.3);
  return 1 + t * (player.radius * 2 - 1);
}

function getRoseFruitRadiusPx(weightKg) {
  const w = clamp(Number(weightKg) || ROSE_BODY_KG, ROSE_KG_MIN, ROSE_KG_MAX);
  const t = (w - ROSE_KG_MIN) / (ROSE_KG_MAX - ROSE_KG_MIN);
  return 3.5 + t * 5;
}

function refillTomatoWeightsIfNeeded(plant) {
  if (!plant.tomatoWeights) plant.tomatoWeights = [];
  while (plant.tomatoWeights.length < 3) {
    plant.tomatoWeights.push(rollTomatoWeightKg());
  }
  plant.tomatoWeights.length = 3;
  for (let i = 0; i < 3; i += 1) {
    plant.tomatoWeights[i] = clamp(Number(plant.tomatoWeights[i]) || 0.7, 0.3, 8);
  }
}

function refillRoseWeightsIfNeeded(plant) {
  if (!plant.roseWeights) plant.roseWeights = [];
  while (plant.roseWeights.length < 2) {
    plant.roseWeights.push(rollRoseWeightKg());
  }
  plant.roseWeights.length = 2;
  for (let i = 0; i < 2; i += 1) {
    plant.roseWeights[i] = clamp(Number(plant.roseWeights[i]) || ROSE_BODY_KG, ROSE_KG_MIN, ROSE_KG_MAX);
  }
}

function drawTomatoFruitWorld(cx, cy, weightKg, goldMutated = false) {
  const d = getTomatoFruitDiameterPx(weightKg);
  const di = Math.max(1, Math.round(d));
  const r = di / 2;
  const ix = Math.round(cx);
  const iy = Math.round(cy);
  const body = goldMutated ? "#c9a020" : "#d42820";
  const hiCol = goldMutated ? "#f0e080" : "#ff7a6e";
  if (di <= 1) {
    ctx.fillStyle = body;
    ctx.fillRect(ix, iy, 1, 1);
    return;
  }
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  const hl = Math.max(1, Math.round(di * 0.22));
  ctx.fillStyle = hiCol;
  ctx.fillRect(Math.round(cx - r * 0.15), Math.round(cy - r * 0.35), hl, hl);
  const calyxH = Math.max(2, Math.round(di * 0.2));
  const calyxW = Math.max(3, Math.round(di * 0.45));
  ctx.fillStyle = goldMutated ? "#6a5a18" : "#1e6b2a";
  ctx.fillRect(Math.round(cx - calyxW / 2), Math.round(cy - r - calyxH * 0.6), calyxW, calyxH);
  ctx.fillStyle = goldMutated ? "#8a7828" : "#2d8a3e";
  ctx.fillRect(Math.round(cx - calyxW / 2 + 1), Math.round(cy - r - calyxH), 2, Math.max(1, Math.round(di * 0.08)));
  ctx.fillRect(Math.round(cx - 1), Math.round(cy - r - calyxH), 2, Math.max(1, Math.round(di * 0.08)));
  ctx.fillRect(Math.round(cx + calyxW / 2 - 3), Math.round(cy - r - calyxH), 2, Math.max(1, Math.round(di * 0.08)));
}

function drawRoseFruitWorld(cx, cy, weightKg, goldMutated = false) {
  const rr = getRoseFruitRadiusPx(weightKg);
  const pet = 5;
  const deep = goldMutated ? "#8a6a10" : "#9b1532";
  const mid = goldMutated ? "#d4a820" : "#e02d52";
  const hi = goldMutated ? "#f5e090" : "#ff6b8a";
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.arc(cx, cy, rr, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < pet; i += 1) {
    const a = (i / pet) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * rr * 0.55;
    const py = cy + Math.sin(a) * rr * 0.55;
    ctx.fillStyle = i % 2 === 0 ? mid : hi;
    ctx.beginPath();
    ctx.ellipse(px, py, rr * 0.62, rr * 0.72, a + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = goldMutated ? "#5a4810" : "#5a1a28";
  ctx.beginPath();
  ctx.arc(cx, cy - rr * 0.15, rr * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function drawStand(stand) {
  if (stand.type === "compost") return;
  const awningHeight = 52;
  const counterHeight = 42;
  const postW = 10;
  const stripeWidth = 18;

  ctx.fillStyle = "#4c311f";
  ctx.fillRect(stand.x + 18, stand.y + awningHeight, postW, stand.h - awningHeight - 8);
  ctx.fillRect(stand.x + stand.w - 28, stand.y + awningHeight, postW, stand.h - awningHeight - 8);

  for (let x = stand.x; x < stand.x + stand.w; x += stripeWidth) {
    const isA = ((x - stand.x) / stripeWidth) % 2 === 0;
    ctx.fillStyle = isA ? stand.stripeA : stand.stripeB;
    ctx.fillRect(x, stand.y, stripeWidth, awningHeight);
  }

  ctx.fillStyle = "#3f2719";
  ctx.beginPath();
  ctx.moveTo(stand.x - 8, stand.y + awningHeight);
  ctx.lineTo(stand.x + stand.w + 8, stand.y + awningHeight);
  ctx.lineTo(stand.x + stand.w, stand.y + awningHeight + 10);
  ctx.lineTo(stand.x, stand.y + awningHeight + 10);
  ctx.closePath();
  ctx.fill();

  drawDirtTexture(
    stand.x + 20,
    stand.y + awningHeight + 10,
    stand.w - 40,
    stand.h - awningHeight - counterHeight - 16,
    "#8f603c",
    "#7f5333",
    "#a06f47"
  );

  ctx.fillStyle = "#6e462a";
  ctx.fillRect(stand.x, stand.y + stand.h - counterHeight, stand.w, counterHeight);
  for (let i = 0; i < 8; i += 1) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(stand.x + 10 + i * 24, stand.y + stand.h - counterHeight + 6);
    ctx.lineTo(stand.x + 10 + i * 24, stand.y + stand.h - 6);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  ctx.fillRect(stand.x + 26, stand.y + 73, stand.w - 52, 48);
  ctx.strokeStyle = "#2f2f2f";
  ctx.lineWidth = 2;
  ctx.strokeRect(stand.x + 26, stand.y + 73, stand.w - 52, 48);

  ctx.fillStyle = stand.textColor;
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(stand.text, stand.x + stand.w / 2, stand.y + 96);

  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(stand.x + 6, stand.y + stand.h + 2, stand.w - 12, 10);
}

function drawMintSerratedLeaf(cx, cy, baseY, tipY, maxHalfW, teeth, fill, stroke, drawVeins) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let i = 0; i <= teeth; i += 1) {
    const t = i / teeth;
    const y = baseY + t * (tipY - baseY);
    const envelope = maxHalfW * Math.sin(Math.PI * (1 - t) * 0.98);
    const bump = i & 1 ? envelope * 0.78 : envelope * 1.16;
    ctx.lineTo(bump, y);
  }
  ctx.lineTo(0, tipY);
  for (let i = teeth; i >= 0; i -= 1) {
    const t = i / teeth;
    const y = baseY + t * (tipY - baseY);
    const envelope = maxHalfW * Math.sin(Math.PI * (1 - t) * 0.98);
    const bump = i & 1 ? envelope * 0.78 : envelope * 1.16;
    ctx.lineTo(-bump, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.1;
  ctx.stroke();

  if (drawVeins) {
    ctx.beginPath();
    ctx.moveTo(0, baseY - 1);
    ctx.lineTo(0, tipY + 2);
    ctx.strokeStyle = "#1a5a3a";
    ctx.lineWidth = 1.35;
    ctx.stroke();
    const laterals = 4;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 1; i <= laterals; i += 1) {
        const t = i / (laterals + 1);
        const y = baseY + t * (tipY - baseY);
        const wAtY = maxHalfW * Math.sin(Math.PI * (1 - t)) * 0.62;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(side * wAtY * 0.45, y + side * 1.5, side * wAtY, y - 2);
        ctx.strokeStyle = "#1a5a3a";
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawMintPlant(plant) {
  const age = plantEffectiveNow(plant) - plant.plantedAt;
  plant.mature = age >= MINT_GROW_MS;
  const px = plant.x;
  const groundY = plant.y;
  const phase = age < 4000 ? 0 : age < 8000 ? 1 : age < 12000 ? 2 : 3;

  const gold = !!plant.mutGold;
  const fillMain = gold ? "#c9a838" : "#52c98a";
  const fillHi = gold ? "#e8c858" : "#6ed9a0";
  const strokeCol = gold ? "#7a6218" : "#2a7a52";

  if (phase === 0) {
    ctx.fillStyle = "#8a603e";
    ctx.beginPath();
    ctx.ellipse(px, groundY, 9, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e3d24";
    ctx.fillRect(px - 2, groundY - 3, 4, 5);
    return;
  }

  if (phase === 1) {
    ctx.strokeStyle = "#2d6b45";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, groundY);
    ctx.lineTo(px, groundY - 8);
    ctx.stroke();
    drawMintSerratedLeaf(px, groundY - 6, 5, -16, 5.5, 3, fillMain, strokeCol, false);
    return;
  }

  if (phase === 2) {
    ctx.strokeStyle = "#2d6b45";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, groundY);
    ctx.lineTo(px, groundY - 10);
    ctx.stroke();
    drawMintSerratedLeaf(px - 4, groundY - 8, 6, -22, 7, 4, fillHi, strokeCol, false);
    drawMintSerratedLeaf(px + 5, groundY - 7, 6, -20, 6.5, 4, fillMain, strokeCol, false);
    return;
  }

  ctx.strokeStyle = "#256341";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, groundY);
  ctx.lineTo(px, groundY - 12);
  ctx.stroke();
  drawMintSerratedLeaf(px - 7, groundY - 10, 7, -30, 11, 6, fillHi, strokeCol, true);
  drawMintSerratedLeaf(px + 8, groundY - 9, 7, -28, 10.5, 6, fillMain, strokeCol, true);
}

function syncTomatoPlant(plant) {
  if (plant.type !== "tomato") return;
  const t = now();
  if (plant.regrowStartedAt != null && t - plant.regrowStartedAt >= TOMATO_REGROW_MS) {
    plant.tomatoesRemaining = 3;
    plant.regrowStartedAt = null;
    plant.tomatoWeights = [];
    plant.tomatoMutationSlots = [];
    refillTomatoWeightsIfNeeded(plant);
    refillTomatoMutationSlotsIfNeeded(plant);
  }
  const growAge = plantEffectiveNow(plant) - plant.plantedAt;
  if (plant.regrowStartedAt == null && growAge >= TOMATO_GROW_MS && plant.tomatoesRemaining == null) {
    plant.tomatoesRemaining = 3;
    plant.tomatoWeights = [];
    plant.tomatoMutationSlots = [];
    refillTomatoWeightsIfNeeded(plant);
    refillTomatoMutationSlotsIfNeeded(plant);
  }
  const tr = plant.tomatoesRemaining;
  if (tr != null && tr > 0) {
    refillTomatoWeightsIfNeeded(plant);
    refillTomatoMutationSlotsIfNeeded(plant);
  } else {
    plant.tomatoWeights = [];
    plant.tomatoMutationSlots = [];
  }
}

function syncRosePlant(plant) {
  if (plant.type !== "rose") return;
  const t = now();
  if (plant.regrowStartedAt != null && t - plant.regrowStartedAt >= ROSE_REGROW_MS) {
    plant.rosesRemaining = 2;
    plant.regrowStartedAt = null;
    plant.roseWeights = [];
    plant.roseMutationSlots = [];
    refillRoseWeightsIfNeeded(plant);
    refillRoseMutationSlotsIfNeeded(plant);
  }
  const growAge = plantEffectiveNow(plant) - plant.plantedAt;
  const fruitReadyAt = ROSE_BUSH_GROW_MS + ROSE_FRUIT_DELAY_MS;
  if (plant.regrowStartedAt == null && growAge >= fruitReadyAt && plant.rosesRemaining == null) {
    plant.rosesRemaining = 2;
    plant.roseWeights = [];
    plant.roseMutationSlots = [];
    refillRoseWeightsIfNeeded(plant);
    refillRoseMutationSlotsIfNeeded(plant);
  }
  const rr = plant.rosesRemaining;
  if (rr != null && rr > 0) {
    refillRoseWeightsIfNeeded(plant);
    refillRoseMutationSlotsIfNeeded(plant);
  } else {
    plant.roseWeights = [];
    plant.roseMutationSlots = [];
  }
  plant.mature = growAge >= ROSE_BUSH_GROW_MS;
}

function roseBushVisualPhase(ageMs) {
  if (ageMs <= 0) return 0;
  if (ageMs >= ROSE_BUSH_GROW_MS) return 3;
  const q = ROSE_BUSH_GROW_MS / 4;
  if (ageMs < q) return 0;
  if (ageMs < q * 2) return 1;
  if (ageMs < q * 3) return 2;
  return 3;
}

function tomatoGrowthVisualStage(ageMs) {
  if (ageMs < TOMATO_SEED_STAGE_MS) return 0;
  if (ageMs >= TOMATO_GROW_MS) return 5;
  const inner = ageMs - TOMATO_SEED_STAGE_MS;
  const seg = (TOMATO_GROW_MS - TOMATO_SEED_STAGE_MS) / 4;
  if (inner < seg) return 1;
  if (inner < seg * 2) return 2;
  if (inner < seg * 3) return 3;
  return 4;
}

function drawTomatoPlant(plant) {
  syncTomatoPlant(plant);
  const px = plant.x;
  const groundY = plant.y;
  const P = TOMATO_PIXEL;
  const bx = Math.round(px - 5 * P);
  const by = Math.round(groundY - 3 * P);
  const soilDark = "#5c3528";
  const soilLight = "#7a4a38";
  const soilHi = "#9a6248";
  const stem = "#1e4d28";
  const stemHi = "#2d6b38";
  const leaf = "#3d8f4a";
  const leafHi = "#52b060";

  const stemCx = bx + 5 * P + P / 2;

  const tb = (dx, dy, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(bx + dx * P, by + dy * P, w * P, h * P);
  };

  const growAge = plantEffectiveNow(plant) - plant.plantedAt;
  const hasFruit = plant.tomatoesRemaining != null && plant.tomatoesRemaining > 0;
  const regrowing = plant.regrowStartedAt != null && now() - plant.regrowStartedAt < TOMATO_REGROW_MS;
  let stage;
  if (growAge < TOMATO_GROW_MS) {
    stage = tomatoGrowthVisualStage(growAge);
  } else if (regrowing || !hasFruit) {
    stage = 4;
  } else {
    stage = 5;
  }

  tb(-2, 0, 11, 3, soilDark);
  tb(-1, -1, 9, 1, soilLight);
  ctx.fillStyle = soilHi;
  ctx.beginPath();
  ctx.moveTo(bx + 2 * P, by);
  ctx.lineTo(bx + 9 * P, by);
  ctx.lineTo(bx + 8 * P, by - P * 0.45);
  ctx.lineTo(bx + 3 * P, by - P * 0.45);
  ctx.closePath();
  ctx.fill();

  const stemRoot = "#3d2618";
  tb(5, 0, 1, 3, stemRoot);

  if (stage === 0) {
    tb(5, -1, 1, 4, stem);
    tb(4, -3, 2, 2, leaf);
    return;
  }
  if (stage === 1) {
    tb(5, -6, 1, 9, stem);
    tb(5, -7, 1, 2, stemHi);
    tb(3, -6, 3, 2, leaf);
    tb(7, -6, 3, 2, leaf);
    tb(6, -6, 1, 2, stem);
    return;
  }
  if (stage === 2) {
    tb(5, -10, 1, 13, stem);
    tb(5, -11, 1, 3, stemHi);
    tb(2, -8, 4, 3, leaf);
    tb(8, -8, 4, 3, leaf);
    tb(6, -8, 2, 3, stem);
    tb(4, -10, 3, 2, leafHi);
    tb(7, -10, 3, 2, leafHi);
    tb(5, -9, 1, 1, stem);
    return;
  }
  if (stage === 3) {
    tb(5, -14, 1, 17, stem);
    tb(5, -15, 1, 4, stemHi);
    tb(1, -10, 4, 3, leaf);
    tb(9, -10, 4, 3, leaf);
    tb(5, -10, 4, 3, stem);
    tb(3, -12, 3, 3, leafHi);
    tb(8, -12, 3, 3, leafHi);
    tb(5, -12, 1, 2, stem);
    tb(5, -14, 2, 2, leaf);
    tb(2, -7, 3, 2, leaf);
    tb(9, -7, 3, 2, leaf);
    tb(4, -7, 2, 2, stem);
    tb(7, -7, 2, 2, stem);
    return;
  }
  if (stage === 4) {
    tb(5, -17, 1, 20, stem);
    tb(5, -18, 1, 4, stemHi);
    tb(0, -11, 5, 4, leaf);
    tb(9, -11, 5, 4, leaf);
    tb(5, -11, 4, 2, stem);
    tb(2, -14, 4, 4, leafHi);
    tb(8, -14, 4, 4, leafHi);
    tb(5, -14, 3, 2, stem);
    tb(4, -17, 3, 3, leaf);
    tb(7, -17, 3, 3, leaf);
    tb(5, -16, 1, 2, stem);
    tb(1, -8, 4, 3, leaf);
    tb(10, -8, 4, 3, leaf);
    tb(5, -8, 5, 2, stem);
    tb(5, -18, 2, 2, leafHi);
    return;
  }

  tb(5, -22, 1, 25, stem);
  tb(5, -23, 1, 6, stemHi);
  tb(-1, -12, 6, 5, leaf);
  tb(9, -12, 6, 5, leaf);
  tb(5, -12, 4, 3, stem);
  tb(1, -16, 5, 5, leafHi);
  tb(8, -16, 5, 5, leafHi);
  tb(5, -15, 1, 3, stem);
  tb(3, -19, 4, 3, leaf);
  tb(7, -19, 4, 3, leaf);
  tb(5, -18, 1, 2, stem);
  tb(0, -9, 5, 3, leaf);
  tb(10, -9, 5, 3, leaf);
  tb(5, -9, 4, 2, stem);
  tb(5, -20, 3, 2, leafHi);
  tb(5, -19, 1, 2, stem);
  tb(3, -7, 3, 2, leaf);
  tb(8, -7, 3, 2, leaf);
  tb(5, -7, 3, 2, stem);

  if (hasFruit && !regrowing) {
    const n = Math.min(plant.tomatoesRemaining, 3);
    const weights = plant.tomatoWeights || [];
    const mslots = plant.tomatoMutationSlots || [];
    const fruitSlots = [
      { cx: bx + 3.5 * P, cy: by - 15.5 * P, tieX: stemCx - 1.2 * P, tieY: by - 9 * P },
      { cx: bx + 9.5 * P, cy: by - 16.5 * P, tieX: stemCx + 1.2 * P, tieY: by - 10 * P },
      { cx: bx + 6.5 * P, cy: by - 22.5 * P, tieX: stemCx, tieY: by - 15 * P },
    ];
    const firstSlot = 3 - n;
    ctx.lineCap = "round";
    for (let si = firstSlot; si < 3; si += 1) {
      const s = fruitSlots[si];
      const wKg = weights[si] ?? 0.7;
      const sm = sanitizeMutationMeta(mslots[si]);
      ctx.strokeStyle = "#2a6b38";
      ctx.lineWidth = Math.max(1, Math.round(P * 0.4));
      ctx.beginPath();
      ctx.moveTo(s.tieX, s.tieY);
      ctx.lineTo(s.cx, s.cy);
      ctx.stroke();
      drawTomatoFruitWorld(s.cx, s.cy, wKg, !!sm.mutGold);
    }
  }
}

function drawRosePlant(plant) {
  syncRosePlant(plant);
  const px = plant.x;
  const groundY = plant.y;
  const growAge = plantEffectiveNow(plant) - plant.plantedAt;
  const bushPhase = roseBushVisualPhase(growAge);
  const hasFruit =
    plant.rosesRemaining != null &&
    plant.rosesRemaining > 0 &&
    growAge >= ROSE_BUSH_GROW_MS + ROSE_FRUIT_DELAY_MS;
  const regrowing = plant.regrowStartedAt != null && now() - plant.regrowStartedAt < ROSE_REGROW_MS;

  const soil = "#5c3528";
  const soilHi = "#7a4a38";
  ctx.fillStyle = soil;
  ctx.beginPath();
  ctx.ellipse(px, groundY + 2, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = soilHi;
  ctx.beginPath();
  ctx.ellipse(px - 2, groundY, 10, 3, -0.2, 0, Math.PI * 2);
  ctx.fill();

  const stem = "#3d2618";
  const leafD = "#2d5a28";
  const leafM = "#3d7a34";
  const leafL = "#4f9a44";

  if (bushPhase === 0) {
    ctx.fillStyle = stem;
    ctx.fillRect(px - 1, groundY - 14, 2, 15);
    ctx.fillStyle = leafM;
    ctx.fillRect(px - 5, groundY - 12, 4, 3);
    ctx.fillRect(px + 2, groundY - 11, 4, 3);
    return;
  }

  if (bushPhase === 1) {
    ctx.fillStyle = stem;
    ctx.fillRect(px - 1, groundY - 18, 2, 19);
    ctx.fillStyle = leafD;
    ctx.beginPath();
    ctx.ellipse(px - 6, groundY - 14, 7, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = leafM;
    ctx.beginPath();
    ctx.ellipse(px + 7, groundY - 13, 6, 4, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = leafL;
    ctx.beginPath();
    ctx.ellipse(px, groundY - 20, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (bushPhase === 2) {
    ctx.fillStyle = stem;
    ctx.fillRect(px - 2, groundY - 22, 3, 23);
    ctx.fillStyle = leafD;
    ctx.beginPath();
    ctx.ellipse(px - 12, groundY - 16, 10, 7, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 12, groundY - 15, 9, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = leafM;
    ctx.beginPath();
    ctx.ellipse(px - 4, groundY - 24, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = leafL;
    ctx.beginPath();
    ctx.ellipse(px + 6, groundY - 26, 8, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillStyle = stem;
  ctx.fillRect(px - 2, groundY - 26, 3, 27);
  ctx.fillStyle = leafD;
  ctx.beginPath();
  ctx.ellipse(px - 16, groundY - 18, 12, 9, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(px + 16, groundY - 17, 11, 8, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = leafM;
  ctx.beginPath();
  ctx.ellipse(px - 6, groundY - 30, 14, 11, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(px + 8, groundY - 32, 12, 9, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = leafL;
  ctx.beginPath();
  ctx.ellipse(px + 1, groundY - 36, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (hasFruit && !regrowing) {
    const n = Math.min(plant.rosesRemaining, 2);
    const weights = plant.roseWeights || [];
    const mslots = plant.roseMutationSlots || [];
    const firstSlot = 2 - n;
    const slots = [
      { cx: px - 10, cy: groundY - 38 },
      { cx: px + 11, cy: groundY - 40 },
    ];
    ctx.lineCap = "round";
    for (let si = firstSlot; si < 2; si += 1) {
      const s = slots[si];
      const wKg = weights[si] ?? ROSE_BODY_KG;
      const sm = sanitizeMutationMeta(mslots[si]);
      ctx.strokeStyle = "#2a4a22";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + (si === 0 ? -4 : 5), groundY - 28);
      ctx.lineTo(s.cx, s.cy + 2);
      ctx.stroke();
      drawRoseFruitWorld(s.cx, s.cy, wKg, !!sm.mutGold);
    }
  }
}

function drawPlant(plant) {
  if (plant.type === "mint") {
    drawMintPlant(plant);
    return;
  }
  if (plant.type === "tomato") {
    drawTomatoPlant(plant);
    return;
  }
  if (plant.type === "rose") {
    drawRosePlant(plant);
    return;
  }

  const age = plantEffectiveNow(plant) - plant.plantedAt;
  const progress = clamp(age / PLANT_GROW_MS, 0, 1);
  plant.mature = progress >= 1;

  const px = plant.x;
  const groundY = plant.y;
  const sway = Math.sin(now() / 220 + plant.x * 0.02) * 1.8;

  if (progress < 0.22) {
    const moundW = 4 + progress * 18;
    const moundH = 2 + progress * 5;
    ctx.fillStyle = "#8a603e";
    ctx.beginPath();
    ctx.ellipse(px, groundY, moundW, moundH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f1cd87";
    ctx.beginPath();
    ctx.ellipse(px + 1, groundY - 1, 2, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (progress < 0.95) {
    const stemH = 8 + progress * 36;
    const topY = groundY - stemH;
    ctx.strokeStyle = "#2f8f34";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, groundY);
    ctx.quadraticCurveTo(px + sway * 0.4, groundY - stemH * 0.5, px + sway, topY);
    ctx.stroke();

    const leafSpread = 5 + progress * 10;
    ctx.fillStyle = "#46aa4a";
    ctx.beginPath();
    ctx.ellipse(px - leafSpread, topY + 8, 7, 4, -0.75, 0, Math.PI * 2);
    ctx.ellipse(px + leafSpread, topY + 8, 7, 4, 0.75, 0, Math.PI * 2);
    ctx.fill();

    if (progress > 0.55) {
      ctx.fillStyle = "#54c15a";
      ctx.beginPath();
      ctx.ellipse(px - 4, topY + 1, 6, 3.2, -0.3, 0, Math.PI * 2);
      ctx.ellipse(px + 4, topY - 1, 6, 3.2, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  const weightScale = getCarrotVisualScale(plant.weightKg ?? 1.09);
  const carrotHalfW = 9 * weightScale;
  const carrotHalfH = 14 * weightScale;
  const carrotTopY = groundY - 9 * weightScale;
  const goldC = !!plant.mutGold;

  ctx.fillStyle = goldC ? "#e8c040" : "#df6e1d";
  ctx.beginPath();
  ctx.ellipse(px, carrotTopY, carrotHalfW, carrotHalfH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = goldC ? "#b89220" : "#bc5610";
  ctx.stroke();

  ctx.strokeStyle = "#2f8f34";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(px, groundY - 18 * weightScale);
  ctx.lineTo(px, groundY - 42 * weightScale);
  ctx.stroke();
  ctx.fillStyle = "#4fb653";
  ctx.beginPath();
  ctx.ellipse(px - 7 * weightScale, groundY - 38 * weightScale, 8 * weightScale, 5 * weightScale, -0.5, 0, Math.PI * 2);
  ctx.ellipse(px + 7 * weightScale, groundY - 38 * weightScale, 8 * weightScale, 5 * weightScale, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlants() {
  plants.forEach((p) => {
    drawPlant(p);
    drawPlantMutationOverlays(p);
  });
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();

  const blobGradient = ctx.createRadialGradient(
    player.x - 10,
    player.y - 12,
    4,
    player.x,
    player.y,
    player.radius
  );
  blobGradient.addColorStop(0, "rgba(255,255,255,0.35)");
  blobGradient.addColorStop(1, "rgba(66,36,124,0.25)");
  ctx.fillStyle = blobGradient;
  ctx.fill();

  ctx.strokeStyle = "#55338f";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(player.x, player.y + 7, player.radius - 6, 0, Math.PI);
  ctx.strokeStyle = "rgba(55, 26, 102, 0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(player.x - 8, player.y - 5, 5.4, 0, Math.PI * 2);
  ctx.arc(player.x + 8, player.y - 5, 5.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#23153a";
  ctx.beginPath();
  ctx.arc(player.x - 8, player.y - 4, 2.4, 0, Math.PI * 2);
  ctx.arc(player.x + 8, player.y - 4, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(player.x - 7.2, player.y - 4.8, 0.8, 0, Math.PI * 2);
  ctx.arc(player.x + 8.8, player.y - 4.8, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(player.x, player.y + 5, 7, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.strokeStyle = "#3a255f";
  ctx.lineWidth = 2.2;
  ctx.stroke();
}

function findEmptyInventorySlot() {
  for (let i = 0; i < inventory.length; i += 1) {
    if (!inventory[i]) return i;
  }
  return -1;
}

function addItem(itemId, amount = 1, meta = null) {
  const itemDef = items[itemId];
  if (!itemDef) return false;

  if (itemDef.stackable) {
    const mKey = mutationMetaKey(meta);
    for (let i = 0; i < inventory.length; i += 1) {
      const slot = inventory[i];
      if (!slot || slot.itemId !== itemId) continue;
      if (mutationMetaKey(slot.meta) !== mKey) continue;
      slot.amount += amount;
      return true;
    }
    const empty = findEmptyInventorySlot();
    if (empty === -1) return false;
    const mut = sanitizeMutationMeta(meta);
    inventory[empty] =
      Object.keys(mut).length > 0 ? { itemId, amount, meta: mut } : { itemId, amount };
    return true;
  }

  for (let n = 0; n < amount; n += 1) {
    const empty = findEmptyInventorySlot();
    if (empty === -1) return false;
    inventory[empty] = { itemId, amount: 1, meta: meta ? { ...meta } : null };
  }
  return true;
}

function removeItem(itemId, amount = 1) {
  for (let i = 0; i < inventory.length; i += 1) {
    const slot = inventory[i];
    if (slot && slot.itemId === itemId && slot.amount >= amount) {
      slot.amount -= amount;
      if (slot.amount === 0) inventory[i] = null;
      return true;
    }
  }
  return false;
}

function countItemUnits(itemId) {
  let total = 0;
  for (let i = 0; i < inventory.length; i += 1) {
    const slot = inventory[i];
    if (!slot || slot.itemId !== itemId) continue;
    total += Math.max(1, Number(slot.amount) || 1);
  }
  return total;
}

function removeItemUnits(itemId, amount) {
  let left = Math.max(0, Math.floor(Number(amount) || 0));
  if (left <= 0) return true;
  for (let i = 0; i < inventory.length && left > 0; i += 1) {
    const slot = inventory[i];
    if (!slot || slot.itemId !== itemId) continue;
    const have = Math.max(1, Number(slot.amount) || 1);
    const take = Math.min(have, left);
    const next = have - take;
    left -= take;
    if (next <= 0) {
      inventory[i] = null;
    } else {
      slot.amount = next;
    }
  }
  return left === 0;
}

function popFirstItem(itemId) {
  for (let i = 0; i < inventory.length; i += 1) {
    const slot = inventory[i];
    if (!slot || slot.itemId !== itemId) continue;
    inventory[i] = null;
    return slot;
  }
  return null;
}

function getUnitSellValueForSlot(slot) {
  if (!slot) return 0;
  const itemDef = items[slot.itemId];
  if (!itemDef || !Number.isFinite(itemDef.sellPrice)) return 0;
  const baseNat = getCropBaseNaturalSellRounded(slot.itemId, slot.meta);
  return applyCropEffectMutationsToValue(baseNat, slot.meta);
}

function getSlotSellValue(slot) {
  if (!slot) return 0;
  const unit = getUnitSellValueForSlot(slot);
  const amount = Math.max(1, Number(slot.amount) || 1);
  return unit * amount;
}

function getMaxBuyableCount(itemId) {
  const item = items[itemId];
  if (!item || !Number.isFinite(item.price) || item.price <= 0) return 0;
  return Math.floor(gameState.money / item.price);
}

function getHotbarSlot(index) {
  return inventory[index];
}

function getSelectedItem() {
  const slot = getHotbarSlot(gameState.selectedHotbar);
  return slot ? items[slot.itemId] : null;
}

function renderItemIcon(item, x, y, size) {
  if (item.icon === "seed") {
    ctx.fillStyle = "#f1cc84";
    ctx.beginPath();
    ctx.ellipse(x + size / 2, y + size / 2, size * 0.24, size * 0.16, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#be9a52";
    ctx.stroke();
    return;
  }

  if (item.icon === "carrot") {
    ctx.fillStyle = "#de6e20";
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y + size * 0.2);
    ctx.lineTo(x + size * 0.75, y + size * 0.8);
    ctx.lineTo(x + size * 0.25, y + size * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4dbb54";
    ctx.fillRect(x + size * 0.44, y + size * 0.06, size * 0.12, size * 0.18);
    return;
  }

  if (item.icon === "mintSeed") {
    ctx.fillStyle = "#c8e8d8";
    ctx.beginPath();
    ctx.ellipse(x + size * 0.5, y + size * 0.55, size * 0.18, size * 0.12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3d8f65";
    ctx.stroke();
    ctx.fillStyle = "#2a5c40";
    ctx.fillRect(x + size * 0.46, y + size * 0.38, size * 0.08, size * 0.12);
    return;
  }

  if (item.icon === "mint") {
    const cx = x + size * 0.5;
    const cy = y + size * 0.62;
    const sc = size / 30;
    drawMintSerratedLeaf(cx - 5 * sc, cy, 2.5 * sc, -11 * sc, 4.8 * sc, 5, "#6ed9a0", "#2a7a52", true);
    drawMintSerratedLeaf(cx + 5 * sc, cy, 2.5 * sc, -10 * sc, 4.5 * sc, 5, "#52c98a", "#2a7a52", true);
    return;
  }

  if (item.icon === "tomatoSeed") {
    ctx.fillStyle = "#f0c8a0";
    ctx.fillRect(x + size * 0.42, y + size * 0.35, size * 0.16, size * 0.22);
    ctx.fillStyle = "#8b2c20";
    ctx.fillRect(x + size * 0.45, y + size * 0.4, size * 0.1, size * 0.12);
    return;
  }

  if (item.icon === "tomato") {
    ctx.fillStyle = "#d42820";
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff7a6e";
    ctx.fillRect(x + size * 0.42, y + size * 0.38, size * 0.06, size * 0.06);
    ctx.fillStyle = "#1e6b2a";
    ctx.fillRect(x + size * 0.48, y + size * 0.22, size * 0.04, size * 0.12);
    return;
  }

  if (item.icon === "roseSeed") {
    ctx.fillStyle = "#c45a6a";
    ctx.fillRect(x + size * 0.4, y + size * 0.38, size * 0.2, size * 0.2);
    ctx.fillStyle = "#2d5a22";
    ctx.fillRect(x + size * 0.47, y + size * 0.28, size * 0.06, size * 0.14);
    ctx.fillStyle = "#8b2940";
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.32, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (item.icon === "rose") {
    drawRoseFruitWorld(x + size * 0.5, y + size * 0.48, ROSE_BODY_KG);
    return;
  }

  if (item.icon === "shovel") {
    ctx.fillStyle = "#6a6a78";
    ctx.fillRect(x + size * 0.42, y + size * 0.15, size * 0.14, size * 0.7);
    ctx.fillStyle = "#8b6914";
    ctx.fillRect(x + size * 0.35, y + size * 0.12, size * 0.28, size * 0.12);
    ctx.fillStyle = "#a0a0b0";
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y + size * 0.82);
    ctx.lineTo(x + size * 0.72, y + size * 0.95);
    ctx.lineTo(x + size * 0.62, y + size * 0.98);
    ctx.lineTo(x + size * 0.45, y + size * 0.88);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (item.icon === "egg") {
    ctx.fillStyle = "#f4ead8";
    ctx.beginPath();
    ctx.ellipse(x + size * 0.5, y + size * 0.52, size * 0.22, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c8b8a0";
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.ellipse(x + size * 0.42, y + size * 0.42, size * 0.06, size * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (item.icon === "petDog") {
    drawPetSheetSprite("dog", x + size * 0.5, y + size * 0.9, size * 1.28, true);
    return;
  }

  if (item.icon === "petBunny") {
    drawPetSheetSprite("bunny", x + size * 0.5, y + size * 0.9, size * 1.28, true);
    return;
  }

  if (item.icon === "petCat") {
    drawPetSheetSprite("cat", x + size * 0.5, y + size * 0.9, size * 1.28, true);
    return;
  }

  if (item.icon === "petTrafficGreen") {
    drawTrafficPetSprite("trafficGreen", x + size * 0.5, y + size * 0.92, 0, true, size * 1.05);
    return;
  }

  if (item.icon === "petTrafficRed") {
    drawTrafficPetSprite("trafficRed", x + size * 0.5, y + size * 0.92, 0, true, size * 1.05);
    return;
  }

  if (item.icon === "fertilizerBag") {
    const col = "#3d7cff";
    ctx.fillStyle = "#d7c29a";
    ctx.fillRect(x + size * 0.3, y + size * 0.25, size * 0.4, size * 0.55);
    ctx.strokeStyle = "#7b6442";
    ctx.strokeRect(x + size * 0.3, y + size * 0.25, size * 0.4, size * 0.55);
    ctx.fillStyle = col;
    ctx.fillRect(x + size * 0.34, y + size * 0.46, size * 0.32, size * 0.2);
    return;
  }
}

function drawHotbar() {
  const { x, y, barW, barH } = getHotbarLayout();
  drawDirtTexture(x, y, barW, barH, "rgba(66, 45, 29, 0.85)", "rgba(54,35,22,0.85)", "rgba(84,57,37,0.85)");
  ctx.strokeStyle = "#efe3cf";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barW, barH);

  for (let i = 0; i < 5; i += 1) {
    const slotX = x + 10 + i * 70;
    const slotY = y + 10;
    const isSelected = i === gameState.selectedHotbar;
    ctx.fillStyle = isSelected ? "#ecd8b7" : "#b89269";
    ctx.fillRect(slotX, slotY, 62, 52);
    ctx.strokeStyle = isSelected ? "#fff9e8" : "#5a3f27";
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeRect(slotX, slotY, 62, 52);

    const stack = getHotbarSlot(i);
    if (stack) {
      const item = items[stack.itemId];
      renderItemIcon(item, slotX + 10, slotY + 6, 34);
      ctx.fillStyle = "#1f140b";
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(String(stack.amount), slotX + 56, slotY + 48);
    }

    ctx.fillStyle = "#2e1f12";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(String(i + 1), slotX + 31, slotY + 54);
  }
}

function drawMoneyAndHints() {
  drawDirtTexture(14, 12, 240, 68, "rgba(73, 49, 32, 0.86)", "rgba(58,37,24,0.86)", "rgba(89,61,40,0.86)");
  ctx.strokeStyle = "#f4e7cf";
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 12, 240, 68);

  ctx.fillStyle = "#fff4de";
  ctx.font = "bold 26px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const moneyText = `$${gameState.money}`;
  ctx.fillText(moneyText, 26, 20);
  const moneyW = ctx.measureText(moneyText).width;
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#f0f6ff";
  ctx.fillText(`🌈 ${Math.floor(gameState.rainbowCoins)}`, 26 + moneyW + 14, 26);

  const selectedStack = getHotbarSlot(gameState.selectedHotbar);
  const selectedItem = getSelectedItem();
  let holdingText = "Empty";
  if (selectedItem) {
    if (
      (selectedItem.id === "carrot" && selectedStack?.meta?.weightKg != null) ||
      (selectedItem.id === "tomato" && selectedStack?.meta?.weightKg != null) ||
      (selectedItem.id === "rose" && selectedStack?.meta?.weightKg != null)
    ) {
      holdingText = `${selectedItem.name} (${toFixedNumber(selectedStack.meta.weightKg, 2)}kg)`;
    } else if (selectedItem.id === "fertilizerBag" && typeof selectedStack?.meta?.rarity === "string") {
      holdingText = `${selectedStack.meta.rarity} fertilizer bag`;
    } else {
      holdingText = selectedItem.name;
    }
  }
  ctx.font = "13px Arial";
  ctx.fillStyle = "#ebdfc9";
  ctx.fillText(`Holding: ${holdingText}`, 26, 52);

  ctx.fillStyle = "rgba(38, 24, 14, 0.75)";
  ctx.fillRect(14, 88, 530, 46);
  ctx.fillStyle = "#f7ead5";
  ctx.font = "12px Arial";
  ctx.fillText(
    "E: plant or harvest | B: inventory | Click hotbar to select | Mouse wheel: change slot | Right-click Buy: set quantity",
    22,
    94
  );
  ctx.fillText(
    "Pet: left-click to pick up | right-click for info panel (Pick up / close) | Middle-click: center map",
    22,
    110
  );
}

function getHotbarLayout() {
  const barW = 360;
  const barH = 72;
  const x = VIEW_WIDTH / 2 - barW / 2;
  const y = VIEW_HEIGHT - barH - 16;
  return { x, y, barW, barH };
}

function pickHotbarSlotFromPoint(mouseX, mouseY) {
  const { x, y } = getHotbarLayout();
  for (let i = 0; i < 5; i += 1) {
    const slotX = x + 10 + i * 70;
    const slotY = y + 10;
    if (mouseX >= slotX && mouseX <= slotX + 62 && mouseY >= slotY && mouseY <= slotY + 52) {
      return i;
    }
  }
  return -1;
}

function sanitizeInventorySlot(slot) {
  if (!slot || !items[slot.itemId]) return null;
  const itemDef = items[slot.itemId];
  const amount = Math.max(1, Math.floor(Number(slot.amount) || 1));
  if (itemDef.stackable) {
    const out = { itemId: slot.itemId, amount };
    const mut = sanitizeMutationMeta(slot.meta);
    if (Object.keys(mut).length) out.meta = mut;
    return out;
  }
  if (slot.itemId === "tomato") {
    const raw = slot.meta ? { ...slot.meta } : {};
    raw.weightKg = clamp(Number(raw.weightKg) || 0.7, 0.3, 8);
    return { itemId: slot.itemId, amount: 1, meta: { weightKg: raw.weightKg, ...sanitizeMutationMeta(raw) } };
  }
  if (slot.itemId === "rose") {
    const raw = slot.meta ? { ...slot.meta } : {};
    raw.weightKg = clamp(Number(raw.weightKg) || ROSE_BODY_KG, ROSE_KG_MIN, ROSE_KG_MAX);
    return { itemId: slot.itemId, amount: 1, meta: { weightKg: raw.weightKg, ...sanitizeMutationMeta(raw) } };
  }
  if (slot.itemId === "carrot") {
    const raw = slot.meta ? { ...slot.meta } : {};
    raw.weightKg = clamp(Number(raw.weightKg) || 1.09, 0.3, 2.3);
    return { itemId: slot.itemId, amount: 1, meta: { weightKg: raw.weightKg, ...sanitizeMutationMeta(raw) } };
  }
  return {
    itemId: slot.itemId,
    amount: 1,
    meta: slot.meta ? { ...slot.meta } : null,
  };
}

function saveProgress() {
  if (gameState.skipLocalStorageWrites) return;
  const payload = {
    mapLayout: "v2",
    money: gameState.money,
    rainbowCoins: Math.max(0, Math.floor(gameState.rainbowCoins)),
    selectedHotbar: gameState.selectedHotbar,
    prereleaseRewardClaimed: !!gameState.prereleaseRewardClaimed,
    player: { x: player.x, y: player.y },
    compost: {
      processing: !!compostState.processing,
      readyAt: compostState.readyAt != null ? compostState.readyAt : 0,
      pendingRarity: compostState.pendingRarity || null,
    },
    redeemedCodes: Array.from(redeemedCodes),
    inventory: inventory.map(sanitizeInventorySlot),
    pets: pets.map((p) => {
      const row = {
        kind: p.kind,
        x: p.x,
        y: p.y,
        facingRight: p.facingRight === false ? false : true,
        moveTargetX: p.moveTargetX != null ? p.moveTargetX : null,
        moveTargetY: p.moveTargetY != null ? p.moveTargetY : null,
        nextCarrotEatAt: p.nextCarrotEatAt != null ? p.nextCarrotEatAt : null,
        nextCatRollAt: p.nextCatRollAt != null ? p.nextCatRollAt : null,
        catNapUntil: p.catNapUntil != null ? p.catNapUntil : null,
        catNapX: p.catNapX != null ? p.catNapX : null,
        catNapY: p.catNapY != null ? p.catNapY : null,
      };
      if (p.kind === "trafficGreen" || p.kind === "trafficRed") {
        row.trafficFrame = p.trafficFrame != null ? p.trafficFrame % 2 : 0;
        row.trafficAnimT = p.trafficAnimT != null ? p.trafficAnimT : null;
        row.nextEffectMutationAt = p.nextEffectMutationAt != null ? p.nextEffectMutationAt : null;
      }
      return row;
    }),
    plants: plants.map((plant) => {
      const row = {
        type:
          plant.type === "mint"
            ? "mint"
            : plant.type === "tomato"
              ? "tomato"
              : plant.type === "rose"
                ? "rose"
                : "carrot",
        x: plant.x,
        y: plant.y,
        plantedAt: plant.plantedAt,
        mature: !!plant.mature,
        mutGold: !!plant.mutGold,
        mutGo: !!plant.mutGo,
        mutStop: !!plant.mutStop,
        mutTraffic: !!plant.mutTraffic,
        goldMutationRolled: !!plant.goldMutationRolled,
      };
      if (row.type === "carrot") {
        row.weightKg = plant.weightKg ?? 1.09;
      }
      if (row.type === "tomato") {
        row.tomatoesRemaining = plant.tomatoesRemaining != null ? plant.tomatoesRemaining : null;
        row.regrowStartedAt = plant.regrowStartedAt != null ? plant.regrowStartedAt : null;
        row.tomatoWeights = Array.isArray(plant.tomatoWeights)
          ? plant.tomatoWeights.map((x) => clamp(Number(x) || 0.7, 0.3, 8))
          : [];
        row.tomatoMutationSlots = Array.isArray(plant.tomatoMutationSlots)
          ? plant.tomatoMutationSlots.map((m) => sanitizeMutationMeta(m))
          : [];
      }
      if (row.type === "rose") {
        row.rosesRemaining = plant.rosesRemaining != null ? plant.rosesRemaining : null;
        row.regrowStartedAt = plant.regrowStartedAt != null ? plant.regrowStartedAt : null;
        row.roseWeights = Array.isArray(plant.roseWeights)
          ? plant.roseWeights.map((x) => clamp(Number(x) || ROSE_BODY_KG, ROSE_KG_MIN, ROSE_KG_MAX))
          : [];
        row.roseMutationSlots = Array.isArray(plant.roseMutationSlots)
          ? plant.roseMutationSlots.map((m) => sanitizeMutationMeta(m))
          : [];
      }
      return row;
    }),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_error) {
    // Ignore storage failures silently to avoid gameplay interruption.
  }
}

function resetSessionAfterFailedLoad() {
  gameState.skipLocalStorageWrites = true;
  gameState.money = 20;
  gameState.rainbowCoins = 0;
  gameState.selectedHotbar = 0;
  gameState.prereleaseRewardClaimed = false;
  gameState.inventoryOpen = false;
  gameState.openMenuType = null;
  gameState.petPanelOpen = false;
  gameState.prereleaseOverlayOpen = false;
  gameState.message = "";
  gameState.messageUntil = 0;
  player.x = 460;
  player.y = 400;
  compostState.processing = false;
  compostState.readyAt = 0;
  compostState.pendingRarity = null;
  for (let i = 0; i < inventory.length; i += 1) {
    inventory[i] = null;
  }
  pets.length = 0;
  plants.length = 0;
}

/** @returns {'loaded' | 'empty' | 'failed'} */
function loadProgress() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (_error) {
    raw = null;
  }
  if (!raw) {
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      try {
        raw = localStorage.getItem(legacyKey);
        if (raw) break;
      } catch (_e) {
        raw = null;
      }
    }
  }
  if (!raw) return "empty";

  try {
    const save = JSON.parse(raw);
    for (let i = 0; i < inventory.length; i += 1) {
      inventory[i] = null;
    }
    pets.length = 0;
    plants.length = 0;
    if (Number.isFinite(save.money)) {
      gameState.money = Math.max(0, Math.floor(save.money));
    }
    if (Number.isFinite(save.rainbowCoins)) {
      gameState.rainbowCoins = Math.max(0, Math.floor(save.rainbowCoins));
    }
    if (Number.isFinite(save.selectedHotbar)) {
      gameState.selectedHotbar = clamp(Math.floor(save.selectedHotbar), 0, 4);
    }
    if (save.prereleaseRewardClaimed === true) {
      gameState.prereleaseRewardClaimed = true;
    }
    redeemedCodes.clear();
    if (Array.isArray(save.redeemedCodes)) {
      for (const c of save.redeemedCodes) {
        if (typeof c === "string" && c.length <= 64) redeemedCodes.add(c);
      }
    }
    const mapV2 = save.mapLayout === "v2";
    if (save.player && Number.isFinite(save.player.x) && Number.isFinite(save.player.y)) {
      let pxx = save.player.x;
      if (!mapV2 && pxx < DIRT_X) pxx += LEFT_COMMERCE_W;
      player.x = clamp(pxx, player.radius, world.width - player.radius);
      player.y = clamp(save.player.y, player.radius, world.height - player.radius);
    }
    compostState.processing = !!save.compost?.processing;
    compostState.readyAt = Number.isFinite(save.compost?.readyAt) ? Number(save.compost.readyAt) : 0;
    compostState.pendingRarity =
      typeof save.compost?.pendingRarity === "string" && FERTILIZER_RARITIES.includes(save.compost.pendingRarity)
        ? save.compost.pendingRarity
        : null;
    if (!compostState.processing) {
      compostState.readyAt = 0;
      compostState.pendingRarity = null;
    }

    if (Array.isArray(save.inventory)) {
      for (let i = 0; i < inventory.length; i += 1) {
        const raw = save.inventory[i] ?? null;
        if (
          raw &&
          raw.itemId === "tomato" &&
          Math.max(1, Math.floor(Number(raw.amount) || 1)) > 1
        ) {
          const amt = Math.max(1, Math.floor(Number(raw.amount) || 1));
          const w0 = Number(raw.meta?.weightKg);
          inventory[i] = sanitizeInventorySlot({
            itemId: "tomato",
            amount: 1,
            meta: { weightKg: Number.isFinite(w0) ? w0 : 0.7 },
          });
          for (let k = 1; k < amt; k += 1) {
            const j = findEmptyInventorySlot();
            if (j === -1) break;
            inventory[j] = sanitizeInventorySlot({
              itemId: "tomato",
              amount: 1,
              meta: { weightKg: 0.7 },
            });
          }
        } else if (
          raw &&
          raw.itemId === "rose" &&
          Math.max(1, Math.floor(Number(raw.amount) || 1)) > 1
        ) {
          const amt = Math.max(1, Math.floor(Number(raw.amount) || 1));
          const w0 = Number(raw.meta?.weightKg);
          inventory[i] = sanitizeInventorySlot({
            itemId: "rose",
            amount: 1,
            meta: { weightKg: Number.isFinite(w0) ? w0 : ROSE_BODY_KG },
          });
          for (let k = 1; k < amt; k += 1) {
            const j = findEmptyInventorySlot();
            if (j === -1) break;
            inventory[j] = sanitizeInventorySlot({
              itemId: "rose",
              amount: 1,
              meta: { weightKg: ROSE_BODY_KG },
            });
          }
        } else {
          inventory[i] = sanitizeInventorySlot(raw);
        }
      }
    }

    if (Array.isArray(save.plants)) {
      plants.length = 0;
      for (const p of save.plants) {
        if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y) || !Number.isFinite(p?.plantedAt)) continue;
        let pxx = Number(p.x);
        if (!mapV2 && pxx < DIRT_X) pxx += LEFT_COMMERCE_W;
        if (!isDirtArea(pxx, p.y)) continue;
        const plantType =
          p.type === "mint" ? "mint" : p.type === "tomato" ? "tomato" : p.type === "rose" ? "rose" : "carrot";
        const base = {
          type: plantType,
          x: clamp(pxx, DIRT_X + 24, DIRT_RIGHT - 24),
          y: clamp(p.y, 110, world.height - 24),
          plantedAt: p.plantedAt,
          mature: !!p.mature,
        };
        if (plantType === "carrot") {
          base.weightKg = clamp(Number(p.weightKg) || 1.09, 0.3, 2.3);
        }
        if (plantType === "tomato") {
          base.tomatoesRemaining = p.tomatoesRemaining != null ? Number(p.tomatoesRemaining) : undefined;
          base.regrowStartedAt = p.regrowStartedAt != null ? Number(p.regrowStartedAt) : null;
          base.tomatoWeights = Array.isArray(p.tomatoWeights)
            ? p.tomatoWeights.map((x) => clamp(Number(x) || 0.7, 0.3, 8))
            : [];
          base.tomatoMutationSlots = Array.isArray(p.tomatoMutationSlots)
            ? p.tomatoMutationSlots.map((m) => sanitizeMutationMeta(m))
            : [];
        }
        if (plantType === "rose") {
          base.rosesRemaining = p.rosesRemaining != null ? Number(p.rosesRemaining) : undefined;
          base.regrowStartedAt = p.regrowStartedAt != null ? Number(p.regrowStartedAt) : null;
          base.roseWeights = Array.isArray(p.roseWeights)
            ? p.roseWeights.map((x) => clamp(Number(x) || ROSE_BODY_KG, ROSE_KG_MIN, ROSE_KG_MAX))
            : [];
          base.roseMutationSlots = Array.isArray(p.roseMutationSlots)
            ? p.roseMutationSlots.map((m) => sanitizeMutationMeta(m))
            : [];
        }
        const normPlantMut = sanitizeMutationMeta(p);
        if (normPlantMut.mutGold) base.mutGold = true;
        if (normPlantMut.mutGo) base.mutGo = true;
        if (normPlantMut.mutStop) base.mutStop = true;
        if (normPlantMut.mutTraffic) base.mutTraffic = true;
        if (p.goldMutationRolled) base.goldMutationRolled = true;
        if (plantType === "tomato" && (!base.tomatoMutationSlots || base.tomatoMutationSlots.length === 0)) {
          const legacy = sanitizeMutationMeta(p);
          if (Object.keys(legacy).length) {
            base.tomatoMutationSlots = [{}, {}, {}];
            for (const si of getTomatoActiveSlotIndices(base)) {
              base.tomatoMutationSlots[si] = { ...legacy };
            }
          }
        }
        if (plantType === "rose" && (!base.roseMutationSlots || base.roseMutationSlots.length === 0)) {
          const legacy = sanitizeMutationMeta(p);
          if (Object.keys(legacy).length) {
            base.roseMutationSlots = [{}, {}];
            for (const si of getRoseActiveSlotIndices(base)) {
              base.roseMutationSlots[si] = { ...legacy };
            }
          }
        }
        plants.push(base);
      }
    }

    if (Array.isArray(save.pets)) {
      pets.length = 0;
      const tLoad = now();
      for (const rp of save.pets) {
        if (!rp || typeof rp.kind !== "string") continue;
        let px = Number(rp.x);
        let py = Number(rp.y);
        if (!mapV2 && px < DIRT_X) px += LEFT_COMMERCE_W;
        let napX = rp.catNapX != null ? Number(rp.catNapX) : null;
        let napY = rp.catNapY != null ? Number(rp.catNapY) : null;
        if (!mapV2 && napX != null && napX < DIRT_X) napX += LEFT_COMMERCE_W;

        if (rp.kind === "trafficGreen" || rp.kind === "trafficRed") {
          if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
          if (!isDirtArea(px, py)) continue;
          const pobj = {
            kind: rp.kind,
            x: clamp(px, DIRT_X + 24, DIRT_RIGHT - 24),
            y: clamp(py, 110, world.height - 24),
            facingRight: rp.facingRight === false ? false : true,
            moveTargetX: rp.moveTargetX != null ? Number(rp.moveTargetX) : null,
            moveTargetY: rp.moveTargetY != null ? Number(rp.moveTargetY) : null,
            nextCarrotEatAt: null,
            nextCatRollAt: null,
            catNapUntil: null,
            catNapX: null,
            catNapY: null,
          };
          pobj.trafficFrame = Number.isFinite(rp.trafficFrame) ? Math.floor(Number(rp.trafficFrame)) % 2 : 0;
          pobj.trafficAnimT =
            rp.trafficAnimT != null && Number.isFinite(rp.trafficAnimT) ? Number(rp.trafficAnimT) : now();
          if (rp.nextEffectMutationAt != null && Number.isFinite(rp.nextEffectMutationAt)) {
            pobj.nextEffectMutationAt = Number(rp.nextEffectMutationAt);
          }
          pets.push(pobj);
          if (pobj.moveTargetX == null) assignPetWanderTarget(pobj);
          continue;
        }

        if (!["dog", "bunny", "cat"].includes(rp.kind)) continue;
        if (!isDirtArea(px, py)) continue;
        const pobj = {
          kind: rp.kind,
          x: clamp(px, DIRT_X + 24, DIRT_RIGHT - 24),
          y: clamp(py, 110, world.height - 24),
          facingRight: rp.facingRight === false ? false : true,
          moveTargetX: rp.moveTargetX != null ? Number(rp.moveTargetX) : null,
          moveTargetY: rp.moveTargetY != null ? Number(rp.moveTargetY) : null,
          nextCarrotEatAt: rp.nextCarrotEatAt != null ? Number(rp.nextCarrotEatAt) : null,
          nextCatRollAt: rp.nextCatRollAt != null ? Number(rp.nextCatRollAt) : null,
          catNapUntil: rp.catNapUntil != null ? Number(rp.catNapUntil) : null,
          catNapX: napX,
          catNapY: napY,
        };
        pets.push(pobj);
        if (pobj.kind === "cat" && pobj.catNapUntil && tLoad <= pobj.catNapUntil && napX != null && napY != null) {
          pobj.x = clamp(napX, DIRT_X + 20, DIRT_RIGHT - 20);
          pobj.y = clamp(napY, 104, world.height - 22);
        } else if (pobj.moveTargetX == null) {
          assignPetWanderTarget(pobj);
        }
      }
    } else {
      pets.length = 0;
    }

    try {
      saveProgress();
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        localStorage.removeItem(legacyKey);
      }
    } catch (_e) {
      // Still keep in-memory progress even if migrate write fails.
    }
    return "loaded";
  } catch (_error) {
    try {
      if (raw) {
        localStorage.setItem(`${STORAGE_KEY}_corrupt_backup`, raw);
      }
    } catch (_backupErr) {
      // ignore
    }
    console.warn("Grow Some Plants: save data failed to load; original not overwritten.", _error);
    resetSessionAfterFailedLoad();
    return "failed";
  }
}

function drawInventoryOverlay() {
  if (!gameState.inventoryOpen) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.56)";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  const panelW = 520;
  const panelH = 540;
  const panelX = VIEW_WIDTH / 2 - panelW / 2;
  const panelY = VIEW_HEIGHT / 2 - panelH / 2;
  drawDirtTexture(panelX, panelY, panelW, panelH, "#795635", "#67472b", "#89623d");
  ctx.strokeStyle = "#f1e4cd";
  ctx.lineWidth = 3;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  ctx.fillStyle = "#f9efd9";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Inventory (100 slots)", panelX + 18, panelY + 14);
  ctx.font = "15px Arial";
  ctx.fillText("Press B to close", panelX + panelW - 130, panelY + 18);

  const cols = 10;
  const rows = 10;
  const slotSize = 44;
  const gap = 4;
  const gridX = panelX + 20;
  const gridY = panelY + 60;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const idx = row * cols + col;
      const x = gridX + col * (slotSize + gap);
      const y = gridY + row * (slotSize + gap);
      const hotbarSlot = idx < 5;
      ctx.fillStyle = hotbarSlot ? "#d2b089" : "#ba956c";
      ctx.fillRect(x, y, slotSize, slotSize);
      ctx.strokeStyle = hotbarSlot ? "#fff0d8" : "#5a3c22";
      ctx.lineWidth = hotbarSlot ? 2.6 : 1.8;
      ctx.strokeRect(x, y, slotSize, slotSize);

      const stack = inventory[idx];
      if (stack) {
        renderItemIcon(items[stack.itemId], x + 8, y + 7, 28);
        ctx.fillStyle = "#2d1b0e";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(String(stack.amount), x + slotSize - 8, y + slotSize - 6);
      }
    }
  }
}

function drawMessage() {
  if (now() > gameState.messageUntil) return;
  const w = 460;
  const h = 46;
  const x = VIEW_WIDTH / 2 - w / 2;
  const y = 16;
  ctx.fillStyle = "rgba(33, 21, 12, 0.86)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#f2dfc2";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#f8ecd9";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(gameState.message, x + w / 2, y + h / 2);
}

function appendBuyProductRow(itemId, label) {
  const item = items[itemId];
  const buyBtn = document.createElement("button");
  buyBtn.type = "button";
  buyBtn.textContent = label;
  menuActions.appendChild(buyBtn);

  const qtyWrap = document.createElement("div");
  qtyWrap.className = "qty-wrap";
  qtyWrap.style.display = "none";

  const minusBtn = document.createElement("button");
  minusBtn.type = "button";
  minusBtn.textContent = "-";
  minusBtn.className = "qty-btn";

  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = "1";
  qtyInput.step = "1";
  qtyInput.value = "1";
  qtyInput.className = "qty-input";

  const plusBtn = document.createElement("button");
  plusBtn.type = "button";
  plusBtn.textContent = "+";
  plusBtn.className = "qty-btn";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.textContent = "All";
  allBtn.className = "qty-btn";

  const buyQtyBtn = document.createElement("button");
  buyQtyBtn.type = "button";
  buyQtyBtn.textContent = "Buy";
  buyQtyBtn.className = "qty-buy-btn";

  const sanitizeQty = (fallback = 1) => {
    const max = Math.max(1, getMaxBuyableCount(itemId));
    const parsed = Math.floor(Number(qtyInput.value));
    const rawVal = Number.isFinite(parsed) ? parsed : fallback;
    const safe = clamp(rawVal, 1, max);
    qtyInput.value = String(safe);
    return safe;
  };

  const buyAmount = (amount) => {
    const maxBuy = getMaxBuyableCount(itemId);
    if (maxBuy <= 0) {
      showMessage("Not enough money.");
      return;
    }
    const qty = clamp(Math.floor(amount), 1, maxBuy);
    if (!addItem(itemId, qty)) {
      showMessage("Inventory is full.");
      return;
    }
    gameState.money -= qty * item.price;
    saveProgress();
    showMessage(`Bought ${qty} x ${item.name}.`);
    sanitizeQty();
  };

  buyBtn.addEventListener("click", () => {
    buyAmount(1);
  });

  buyBtn.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    qtyWrap.style.display = "flex";
    sanitizeQty();
    showMessage(`Quantity for ${item.name}: type a number, or use +, -, and All.`);
  });

  minusBtn.addEventListener("click", () => {
    qtyInput.value = String(Math.max(1, (Math.floor(Number(qtyInput.value) || 1) - 1)));
    sanitizeQty();
  });

  plusBtn.addEventListener("click", () => {
    qtyInput.value = String(Math.floor(Number(qtyInput.value) || 1) + 1);
    sanitizeQty();
  });

  qtyInput.addEventListener("focus", () => {
    qtyInput.select();
  });

  qtyInput.addEventListener("input", () => {
    const cleaned = qtyInput.value.replace(/[^\d]/g, "");
    qtyInput.value = cleaned;
  });

  qtyInput.addEventListener("blur", () => {
    sanitizeQty();
  });

  allBtn.addEventListener("click", () => {
    const maxBuy = getMaxBuyableCount(itemId);
    if (maxBuy <= 0) {
      showMessage("Not enough money.");
      return;
    }
    qtyInput.value = String(maxBuy);
    buyAmount(maxBuy);
  });

  buyQtyBtn.addEventListener("click", () => {
    buyAmount(sanitizeQty());
  });

  qtyWrap.append(minusBtn, qtyInput, plusBtn, allBtn, buyQtyBtn);
  menuActions.appendChild(qtyWrap);
}

function getCompostStateLabel() {
  const t = now();
  if (!compostState.processing) return "Machine idle.";
  if (compostState.readyAt > t) {
    const sec = Math.max(1, Math.ceil((compostState.readyAt - t) / 1000));
    return `Processing... ${sec}s remaining.`;
  }
  if (compostState.pendingRarity) {
    return `Done! Claim your ${compostState.pendingRarity} fertilizer bag.`;
  }
  return "Machine idle.";
}

function startRareCompostBatch() {
  if (compostState.processing) {
    showMessage("Compost machine is busy.");
    return false;
  }
  if (countItemUnits("rose") < 3) {
    showMessage("Need 3 roses to start rare fertilizer.");
    return false;
  }
  if (!removeItemUnits("rose", 3)) {
    showMessage("Could not remove 3 roses.");
    return false;
  }
  compostState.processing = true;
  compostState.readyAt = now() + COMPOST_PROCESS_MS;
  compostState.pendingRarity = "rare";
  saveProgress();
  showMessage("Compost started: rare fertilizer in a few moments.");
  return true;
}

function claimCompostBatch() {
  if (!compostState.processing || !compostState.pendingRarity) {
    showMessage("Nothing to claim.");
    return false;
  }
  if (now() < compostState.readyAt) {
    showMessage("Compost still processing.");
    return false;
  }
  const rarity = compostState.pendingRarity;
  if (!addItem("fertilizerBag", 1, { rarity })) {
    showMessage("Inventory full. Cannot claim fertilizer bag.");
    return false;
  }
  compostState.processing = false;
  compostState.readyAt = 0;
  compostState.pendingRarity = null;
  saveProgress();
  showMessage(`Claimed ${rarity} fertilizer bag.`);
  return true;
}

function setMenu(stand) {
  closePetPanel();
  gameState.openMenuType = stand.type;
  menuTitle.textContent = stand.menuTitle;
  menuDesc.textContent = stand.menuDesc;
  menuActions.innerHTML = "";

  if (stand.type === "buyGear") {
    appendBuyProductRow("shovel", `Buy Shovel ($${items.shovel.price})`);
  }

  if (stand.type === "buyPet") {
    appendBuyProductRow("commonEgg", `Buy Common Egg ($${items.commonEgg.price})`);
  }

  if (stand.type === "buy") {
    appendBuyProductRow("carrotSeed", `Buy Carrot Seed ($${items.carrotSeed.price})`);
    appendBuyProductRow("mintSeed", `Buy Mint Seed ($${items.mintSeed.price})`);
    appendBuyProductRow("tomatoSeed", `Buy Tomato Seed ($${items.tomatoSeed.price})`);
    appendBuyProductRow("roseSeed", `Buy Rose Bush Seed ($${items.roseSeed.price})`);
  }

  if (stand.type === "sell") {
    const sellAllBtn = document.createElement("button");
    sellAllBtn.type = "button";
    sellAllBtn.textContent = "Sell all inventory";
    sellAllBtn.addEventListener("click", () => {
      let total = 0;
      let soldCount = 0;
      for (let i = 0; i < inventory.length; i += 1) {
        const slot = inventory[i];
        if (!slot) continue;
        const value = getSlotSellValue(slot);
        if (value <= 0) continue;
        total += value;
        soldCount += Math.max(1, Number(slot.amount) || 1);
        inventory[i] = null;
      }
      if (total <= 0) {
        showMessage("No sellable items in inventory.");
        return;
      }
      gameState.money += total;
      saveProgress();
      showMessage(`Sold ${soldCount} item(s) for $${total}.`);
    });
    menuActions.appendChild(sellAllBtn);

    const sellHoldingBtn = document.createElement("button");
    sellHoldingBtn.type = "button";
    sellHoldingBtn.textContent = "Sell selected hotbar item";
    sellHoldingBtn.addEventListener("click", () => {
      const slotIdx = gameState.selectedHotbar;
      const holding = inventory[slotIdx];
      if (!holding) {
        showMessage("No item in the selected hotbar slot.");
        return;
      }
      const value = getSlotSellValue(holding);
      if (value <= 0) {
        showMessage("This item cannot be sold.");
        return;
      }
      gameState.money += value;
      inventory[slotIdx] = null;
      saveProgress();
      showMessage(`Sold item for $${value}.`);
    });
    menuActions.appendChild(sellHoldingBtn);

    const priceBtn = document.createElement("button");
    priceBtn.type = "button";
    priceBtn.textContent = "Check sell price (hotbar slot)";
    priceBtn.addEventListener("click", () => {
      const holding = inventory[gameState.selectedHotbar];
      if (!holding) {
        showMessage("No item in the selected hotbar slot.");
        return;
      }
      const value = getSlotSellValue(holding);
      if (value <= 0) {
        showMessage("This item has no sell price.");
        return;
      }
      if (holding.itemId === "carrot") {
        const weightKg = clamp(Number(holding.meta?.weightKg) || 1.09, 0.3, 2.3);
        showMessage(`Carrot: ${toFixedNumber(weightKg, 2)} kg, worth $${value}.`);
        return;
      }
      if (holding.itemId === "mint") {
        showMessage(`Mint: worth $${value} (stack of ${holding.amount}).`);
        return;
      }
      if (holding.itemId === "tomato") {
        const weightKg = clamp(Number(holding.meta?.weightKg) || 0.7, 0.3, 8);
        showMessage(`Tomato: ${toFixedNumber(weightKg, 2)} kg, worth $${value}.`);
        return;
      }
      if (holding.itemId === "rose") {
        const weightKg = clamp(Number(holding.meta?.weightKg) || ROSE_BODY_KG, ROSE_KG_MIN, ROSE_KG_MAX);
        showMessage(`Rose: ${toFixedNumber(weightKg, 2)} kg, worth $${value}.`);
        return;
      }
      showMessage(`Sell value: $${value}.`);
    });
    menuActions.appendChild(priceBtn);
  }

  if (stand.type === "compost") {
    const status = document.createElement("p");
    status.textContent = getCompostStateLabel();
    menuActions.appendChild(status);

    const startRareBtn = document.createElement("button");
    startRareBtn.type = "button";
    startRareBtn.textContent = "Deposit 3 Roses -> Rare Fertilizer";
    startRareBtn.addEventListener("click", () => {
      if (startRareCompostBatch()) setMenu(stand);
    });
    menuActions.appendChild(startRareBtn);

    const claimBtn = document.createElement("button");
    claimBtn.type = "button";
    claimBtn.textContent = "Claim Fertilizer Bag";
    claimBtn.addEventListener("click", () => {
      if (claimCompostBatch()) setMenu(stand);
    });
    menuActions.appendChild(claimBtn);
  }

  if (stand.type === "redeemCode") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter code (example: h4abz:c.)";
    input.className = "redeem-code-input";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.maxLength = 32;
    menuActions.appendChild(input);

    const redeemBtn = document.createElement("button");
    redeemBtn.type = "button";
    redeemBtn.textContent = "Redeem";
    redeemBtn.addEventListener("click", () => {
      redeemRainbowCode(input.value);
    });
    menuActions.appendChild(redeemBtn);

    const hint = document.createElement("p");
    hint.style.margin = "0.6rem 0 0";
    hint.style.fontSize = "0.9rem";
    hint.style.lineHeight = "1.35";
    hint.textContent = "Digit 2 must be a number. Digits 3/5/7: a..i => 1..9, z => 0. Use '.' to end.";
    menuActions.appendChild(hint);

    const diag = document.createElement("pre");
    diag.style.margin = "0.7rem 0 0";
    diag.style.fontSize = "0.78rem";
    diag.style.whiteSpace = "pre-wrap";
    diag.textContent = getSaveDiagnosticsText();
    menuActions.appendChild(diag);

    const exportLabel = document.createElement("p");
    exportLabel.style.margin = "0.6rem 0 0.25rem";
    exportLabel.style.fontWeight = "800";
    exportLabel.textContent = "Export / Import Save (to move between devices/URLs):";
    menuActions.appendChild(exportLabel);

    const area = document.createElement("textarea");
    area.className = "redeem-code-area";
    area.placeholder = "Click Export Save to fill, or paste a GSP1: save string here to import.";
    menuActions.appendChild(area);

    const exportBtn = document.createElement("button");
    exportBtn.type = "button";
    exportBtn.textContent = "Export Save";
    exportBtn.addEventListener("click", () => {
      const blob = exportSaveBlob();
      if (!blob) {
        showMessage("No save found to export.");
        return;
      }
      area.value = blob;
      area.focus();
      area.select();
      showMessage("Save exported into the text box. Copy it.");
    });
    menuActions.appendChild(exportBtn);

    const importBtn = document.createElement("button");
    importBtn.type = "button";
    importBtn.textContent = "Import Save";
    importBtn.addEventListener("click", () => {
      importSaveFromString(area.value);
    });
    menuActions.appendChild(importBtn);

    window.setTimeout(() => input.focus(), 0);
  }

  menuOverlay.classList.remove("hidden");
}

function closeMenu() {
  menuOverlay.classList.add("hidden");
  gameState.openMenuType = null;
}

function updateCamera() {
  if (cameraMode === "centered") {
    camera.x = clamp((world.width - VIEW_WIDTH) / 2, 0, Math.max(0, world.width - VIEW_WIDTH));
    camera.y = 0;
    return;
  }
  camera.x = player.x - VIEW_WIDTH / 2;
  camera.x = clamp(camera.x, 0, world.width - VIEW_WIDTH);
  camera.y = 0;
}

function updatePlayer() {
  if (
    gameState.openMenuType ||
    gameState.inventoryOpen ||
    gameState.petPanelOpen ||
    gameState.prereleaseOverlayOpen
  ) {
    return;
  }

  let dx = 0;
  let dy = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;

  if (dx !== 0 && dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
  }

  if (dx !== 0 || dy !== 0) {
    cameraMode = "follow";
  }
  const spd = player.speed * getDogSpeedMultiplier();
  player.x += dx * spd;
  player.y += dy * spd;
  player.x = clamp(player.x, player.radius, world.width - player.radius);
  player.y = clamp(player.y, player.radius, world.height - player.radius);
}

function tryOpenStandMenu() {
  if (
    gameState.openMenuType ||
    gameState.inventoryOpen ||
    gameState.petPanelOpen ||
    gameState.prereleaseOverlayOpen
  ) {
    return;
  }
  for (const stand of stands) {
    if (circleIntersectsRect(player, stand)) {
      setMenu(stand);
      return;
    }
  }
}

function findNearbyPlant(maxDistance = 56) {
  let nearest = null;
  let nearestDistSq = maxDistance * maxDistance;
  for (const plant of plants) {
    const dx = plant.x - player.x;
    const dy = plant.y - player.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= nearestDistSq) {
      nearest = plant;
      nearestDistSq = distSq;
    }
  }
  return nearest;
}

function isDirtArea(x, y) {
  return x > DIRT_X + 16 && x < DIRT_RIGHT - 14 && y > 96 && y < world.height - 20;
}

function getPlantingPositionFromPlayer() {
  if (!isDirtArea(player.x, player.y)) return null;
  const snappedX = Math.round(player.x / PLANT_GRID) * PLANT_GRID;
  const snappedY = Math.round((player.y + player.radius * 0.45) / PLANT_GRID) * PLANT_GRID;
  const plantX = clamp(snappedX, DIRT_X + 24, DIRT_RIGHT - 24);
  const plantY = clamp(snappedY, 110, world.height - 24);
  if (!isDirtArea(plantX, plantY)) return null;
  return { x: plantX, y: plantY };
}

function hasPlantAt(x, y) {
  return plants.some((plant) => Math.hypot(plant.x - x, plant.y - y) < 12);
}

function interactWithGround() {
  if (
    gameState.openMenuType ||
    gameState.inventoryOpen ||
    gameState.petPanelOpen ||
    gameState.prereleaseOverlayOpen
  ) {
    return;
  }

  const plantPosEarly = getPlantingPositionFromPlayer();
  const selectedEarly = getHotbarSlot(gameState.selectedHotbar);

  if (selectedEarly?.itemId === "commonEgg" && plantPosEarly && !hasOccupiedAt(plantPosEarly.x, plantPosEarly.y)) {
    if (!removeItem("commonEgg", 1)) {
      showMessage("No egg to hatch.");
      return;
    }
    const petId = rollPetFromEgg();
    if (!addItem(petId, 1)) {
      addItem("commonEgg", 1);
      showMessage("Inventory full.");
      return;
    }
    saveProgress();
    showMessage(`Egg hatched: ${items[petId].name}!`);
    return;
  }

  if (
    selectedEarly &&
    (selectedEarly.itemId === "petDog" ||
      selectedEarly.itemId === "petBunny" ||
      selectedEarly.itemId === "petCat" ||
      selectedEarly.itemId === "petTrafficGreen" ||
      selectedEarly.itemId === "petTrafficRed") &&
    plantPosEarly &&
    !hasOccupiedAt(plantPosEarly.x, plantPosEarly.y)
  ) {
    const slotIdx = gameState.selectedHotbar;
    const slot = inventory[slotIdx];
    if (!slot) {
      showMessage("Hold a pet to place.");
      return;
    }
    const kindMap = {
      petDog: "dog",
      petBunny: "bunny",
      petCat: "cat",
      petTrafficGreen: "trafficGreen",
      petTrafficRed: "trafficRed",
    };
    const kind = kindMap[slot.itemId];
    if (!kind) return;
    const petLabel = items[slot.itemId].name;
    inventory[slotIdx] = null;
    const newPet = { kind, x: plantPosEarly.x, y: plantPosEarly.y };
    pets.push(newPet);
    initPetMovementState(newPet);
    saveProgress();
    showMessage(`${petLabel} is out in your garden.`);
    return;
  }

  if (selectedEarly?.itemId === "shovel" && plantPosEarly) {
    showMessage("Shovel: feature coming soon.");
    return;
  }

  const nearbyPlant = findNearbyPlant();
  if (nearbyPlant && nearbyPlant.type === "tomato") {
    syncTomatoPlant(nearbyPlant);
    const growAge = plantEffectiveNow(nearbyPlant) - nearbyPlant.plantedAt;
    if (growAge < TOMATO_GROW_MS) {
      showMessage("Tomato still growing...");
      return;
    }
    if (nearbyPlant.regrowStartedAt != null) {
      if (now() - nearbyPlant.regrowStartedAt < TOMATO_REGROW_MS) {
        showMessage("Tomatoes regrowing...");
        return;
      }
    }
    const left = nearbyPlant.tomatoesRemaining ?? 0;
    if (left > 0) {
      const slotIdx = 3 - left;
      const ws = nearbyPlant.tomatoWeights || [];
      const w =
        ws[slotIdx] != null ? clamp(Number(ws[slotIdx]) || 0.7, 0.3, 8) : rollTomatoWeightKg();
      const hmT = getHarvestMutationMetaFromPlantSlot(nearbyPlant, slotIdx);
      const tomatoMeta = hmT ? { weightKg: w, ...hmT } : { weightKg: w };
      if (!addItem("tomato", 1, tomatoMeta)) {
        showMessage("Inventory full. Cannot harvest.");
        return;
      }
      if (Array.isArray(nearbyPlant.tomatoMutationSlots)) {
        nearbyPlant.tomatoMutationSlots[slotIdx] = {};
      }
      nearbyPlant.tomatoesRemaining = left - 1;
      if (nearbyPlant.tomatoesRemaining === 0) {
        nearbyPlant.regrowStartedAt = now();
        saveProgress();
        showMessage("Last tomato picked. Vine regrows in 50s.");
        return;
      }
      saveProgress();
      showMessage(`Tomato harvested. ${nearbyPlant.tomatoesRemaining} left on plant.`);
      return;
    }
    showMessage("Wait for tomatoes to regrow.");
    return;
  }

  if (nearbyPlant && nearbyPlant.type === "rose") {
    syncRosePlant(nearbyPlant);
    const growAge = plantEffectiveNow(nearbyPlant) - nearbyPlant.plantedAt;
    if (growAge < ROSE_BUSH_GROW_MS) {
      showMessage("Rose bush still growing...");
      return;
    }
    if (growAge < ROSE_BUSH_GROW_MS + ROSE_FRUIT_DELAY_MS) {
      showMessage("Roses budding...");
      return;
    }
    if (nearbyPlant.regrowStartedAt != null) {
      if (now() - nearbyPlant.regrowStartedAt < ROSE_REGROW_MS) {
        showMessage("Roses regrowing...");
        return;
      }
    }
    const leftR = nearbyPlant.rosesRemaining ?? 0;
    if (leftR > 0) {
      const slotIdx = 2 - leftR;
      const ws = nearbyPlant.roseWeights || [];
      const w =
        ws[slotIdx] != null
          ? clamp(Number(ws[slotIdx]) || ROSE_BODY_KG, ROSE_KG_MIN, ROSE_KG_MAX)
          : rollRoseWeightKg();
      const hmR = getHarvestMutationMetaFromPlantSlot(nearbyPlant, slotIdx);
      const roseMeta = hmR ? { weightKg: w, ...hmR } : { weightKg: w };
      if (!addItem("rose", 1, roseMeta)) {
        showMessage("Inventory full. Cannot harvest.");
        return;
      }
      if (Array.isArray(nearbyPlant.roseMutationSlots)) {
        nearbyPlant.roseMutationSlots[slotIdx] = {};
      }
      nearbyPlant.rosesRemaining = leftR - 1;
      if (nearbyPlant.rosesRemaining === 0) {
        nearbyPlant.regrowStartedAt = now();
        saveProgress();
        showMessage("Last rose picked. New blooms in 60s.");
        return;
      }
      saveProgress();
      showMessage(`Rose picked. ${nearbyPlant.rosesRemaining} left on bush.`);
      return;
    }
    showMessage("Wait for roses to regrow.");
    return;
  }

  if (nearbyPlant && nearbyPlant.mature) {
    if (nearbyPlant.type === "mint") {
      const hmM = harvestMutationMetaFromPlant(nearbyPlant);
      if (!addItem("mint", 1, hmM || undefined)) {
        showMessage("Inventory full. Cannot harvest.");
        return;
      }
      const plantIndex = plants.indexOf(nearbyPlant);
      if (plantIndex !== -1) plants.splice(plantIndex, 1);
      saveProgress();
      showMessage("Harvested mint.");
      return;
    }
    const harvestWeight = clamp(Number(nearbyPlant.weightKg) || 1.09, 0.3, 2.3);
    const hmC = harvestMutationMetaFromPlant(nearbyPlant);
    const carrotMeta = hmC ? { weightKg: harvestWeight, ...hmC } : { weightKg: harvestWeight };
    if (!addItem("carrot", 1, carrotMeta)) {
      showMessage("Inventory full. Cannot harvest.");
      return;
    }
    const plantIndex = plants.indexOf(nearbyPlant);
    if (plantIndex !== -1) plants.splice(plantIndex, 1);
    saveProgress();
    showMessage(`Harvested carrot: ${toFixedNumber(harvestWeight, 2)}kg.`);
    return;
  }

  if (nearbyPlant && !nearbyPlant.mature) {
    showMessage("Still growing...");
    return;
  }

  const plantPos = getPlantingPositionFromPlayer();
  if (!plantPos) {
    showMessage("You can only plant on dirt.");
    return;
  }

  if (hasOccupiedAt(plantPos.x, plantPos.y)) {
    showMessage("This spot is already occupied.");
    return;
  }

  const selectedStack = getHotbarSlot(gameState.selectedHotbar);
  if (!selectedStack) {
    showMessage("Hold a seed in hotbar to plant.");
    return;
  }
  if (selectedStack.itemId === "carrotSeed") {
    removeItem("carrotSeed", 1);
    plants.push({
      type: "carrot",
      x: plantPos.x,
      y: plantPos.y,
      plantedAt: now(),
      mature: false,
      weightKg: rollCarrotWeight(),
    });
    saveProgress();
    showMessage("Planted carrot seed.");
    return;
  }
  if (selectedStack.itemId === "mintSeed") {
    removeItem("mintSeed", 1);
    plants.push({
      type: "mint",
      x: plantPos.x,
      y: plantPos.y,
      plantedAt: now(),
      mature: false,
    });
    saveProgress();
    showMessage("Planted mint seed.");
    return;
  }
  if (selectedStack.itemId === "tomatoSeed") {
    removeItem("tomatoSeed", 1);
    plants.push({
      type: "tomato",
      x: plantPos.x,
      y: plantPos.y,
      plantedAt: now(),
      tomatoesRemaining: undefined,
      regrowStartedAt: null,
      tomatoWeights: [],
      tomatoMutationSlots: [],
    });
    saveProgress();
    showMessage("Planted tomato seed.");
    return;
  }
  if (selectedStack.itemId === "roseSeed") {
    removeItem("roseSeed", 1);
    plants.push({
      type: "rose",
      x: plantPos.x,
      y: plantPos.y,
      plantedAt: now(),
      mature: false,
      rosesRemaining: undefined,
      regrowStartedAt: null,
      roseWeights: [],
      roseMutationSlots: [],
    });
    saveProgress();
    showMessage("Planted rose bush seed.");
    return;
  }
  showMessage("Hold a seed in hotbar to plant.");
}

function drawScene() {
  updateCamera();
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawGardenBackground();
  drawPlants();
  drawPets();
  drawComingSoonTree();
  drawCompostMachine();
  stands.forEach(drawStand);
  drawPlayer();
  ctx.restore();
  drawHotbar();
  drawMoneyAndHints();
  drawMessage();
  drawInventoryOverlay();
}

let lastGameLoopMs = now();

function gameLoop() {
  const t = now();
  const dt = Math.min(80, t - lastGameLoopMs);
  lastGameLoopMs = t;
  syncAllPlantGoldRolls();
  updatePetBehaviors();
  updatePlayer();
  tryOpenStandMenu();
  updatePetMovement(dt);
  updatePetPanelTimer();
  drawScene();
  if (now() - lastAutoSaveAt > 3000) {
    saveProgress();
    lastAutoSaveAt = now();
  }
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (!gameState.prereleaseOverlayOpen) {
    if (key === "arrowup" || key === "w") keys.up = true;
    if (key === "arrowdown" || key === "s") keys.down = true;
    if (key === "arrowleft" || key === "a") keys.left = true;
    if (key === "arrowright" || key === "d") keys.right = true;
  }

  if (key === "escape") {
    closeMenu();
    closePetPanel();
    if (gameState.prereleaseOverlayOpen) hidePrereleaseOverlay();
  }
  if (key === "b") {
    if (gameState.prereleaseOverlayOpen) return;
    if (!gameState.openMenuType) {
      closePetPanel();
      gameState.inventoryOpen = !gameState.inventoryOpen;
      saveProgress();
    }
  }
  if (key === "e") {
    if (gameState.openMenuType || gameState.petPanelOpen || gameState.prereleaseOverlayOpen) return;
    interactWithGround();
  }
  if (["1", "2", "3", "4", "5"].includes(key)) {
    if (gameState.prereleaseOverlayOpen) return;
    gameState.selectedHotbar = Number(key) - 1;
    saveProgress();
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") keys.up = false;
  if (key === "arrowdown" || key === "s") keys.down = false;
  if (key === "arrowleft" || key === "a") keys.left = false;
  if (key === "arrowright" || key === "d") keys.right = false;
});

window.addEventListener("wheel", (event) => {
  event.preventDefault();
  if (
    gameState.openMenuType ||
    gameState.inventoryOpen ||
    gameState.petPanelOpen ||
    gameState.prereleaseOverlayOpen
  ) {
    return;
  }
  const dir = Math.sign(event.deltaY);
  if (dir > 0) gameState.selectedHotbar = (gameState.selectedHotbar + 1) % 5;
  if (dir < 0) gameState.selectedHotbar = (gameState.selectedHotbar + 4) % 5;
  saveProgress();
}, { passive: false });

function centerMapCamera() {
  cameraMode = "centered";
}

canvas.addEventListener("mousedown", (event) => {
  if (event.button === 1) {
    event.preventDefault();
    centerMapCamera();
    return;
  }
  if (event.button !== 0) return;
  if (gameState.prereleaseOverlayOpen) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = VIEW_WIDTH / rect.width;
  const scaleY = VIEW_HEIGHT / rect.height;
  const mouseX = (event.clientX - rect.left) * scaleX;
  const mouseY = (event.clientY - rect.top) * scaleY;
  const slot = pickHotbarSlotFromPoint(mouseX, mouseY);
  if (slot !== -1) {
    gameState.selectedHotbar = slot;
    saveProgress();
    return;
  }
  if (gameState.openMenuType || gameState.inventoryOpen || gameState.petPanelOpen) return;
  const petHit = findPetAtScreen(mouseX, mouseY);
  if (petHit) {
    const itemId = petKindToInventoryId(petHit.kind);
    if (!addItem(itemId, 1)) {
      showMessage("Inventory full. Cannot pick up pet.");
      return;
    }
    const idx = pets.indexOf(petHit);
    if (idx !== -1) pets.splice(idx, 1);
    saveProgress();
    showMessage(
      `${items[itemId].name} picked up. Select it in the hotbar and press E on empty dirt to release it.`
    );
  }
});

canvas.addEventListener("contextmenu", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = VIEW_WIDTH / rect.width;
  const scaleY = VIEW_HEIGHT / rect.height;
  const mouseX = (event.clientX - rect.left) * scaleX;
  const mouseY = (event.clientY - rect.top) * scaleY;
  tryPetRightClickInfo(event, mouseX, mouseY);
});

canvas.addEventListener(
  "pointerdown",
  (event) => {
    if (event.button !== 2) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIEW_WIDTH / rect.width;
    const scaleY = VIEW_HEIGHT / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    if (tryPetRightClickInfo(event, mouseX, mouseY)) {
      event.stopPropagation();
    }
  },
  true
);

canvas.addEventListener("auxclick", (event) => {
  if (event.button === 1) {
    event.preventDefault();
    centerMapCamera();
  }
});

closeMenuBtn.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", (event) => {
  if (event.target === menuOverlay) closeMenu();
});

if (petPanelCloseBtn) {
  petPanelCloseBtn.addEventListener("click", closePetPanel);
}
if (petPanelPickUpBtn) {
  petPanelPickUpBtn.addEventListener("click", pickUpPetFromPanel);
}
if (petPanelOverlay) {
  petPanelOverlay.addEventListener("click", (event) => {
    if (event.target === petPanelOverlay) closePetPanel();
  });
}

if (prereleaseClaimBtn) {
  prereleaseClaimBtn.addEventListener("click", claimPrereleaseRewards);
}
if (prereleaseLaterBtn) {
  prereleaseLaterBtn.addEventListener("click", hidePrereleaseOverlay);
}
if (prereleaseOverlay) {
  prereleaseOverlay.addEventListener("click", (event) => {
    if (event.target === prereleaseOverlay) hidePrereleaseOverlay();
  });
}

initPetSheet();
initComingSoonTree();
initTrafficSheets();

if (redeemCodeBtn) {
  redeemCodeBtn.addEventListener("click", () => {
    if (gameState.prereleaseOverlayOpen) return;
    const stand = {
      type: "redeemCode",
      menuTitle: "Redeem Code",
      menuDesc: "Redeem a code to receive rainbow coins. Codes can only be redeemed once per account.",
    };
    setMenu(stand);
  });
}

const bootLoadOutcome = loadProgress();
if (bootLoadOutcome === "empty") {
  saveProgress();
}
drawScene();

let bootSequenceStarted = false;
let loadingFinishTimeoutId = null;
let loadingFinished = false;

function finishLoadingAndStartGame() {
  if (loadingFinished) return;
  loadingFinished = true;
  if (loadingFinishTimeoutId != null) {
    clearTimeout(loadingFinishTimeoutId);
    loadingFinishTimeoutId = null;
  }
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    loadingScreen.setAttribute("aria-hidden", "true");
  }
  if (bootLoadOutcome === "loaded") {
    showMessage("Save loaded.");
  } else if (bootLoadOutcome === "failed") {
    showMessage(
      "Save could not be read (not deleted). A copy may be in Local Storage as grow_some_plants_save_corrupt_backup — ask for help restoring."
    );
  } else {
    showMessage("Start with $20. Buy seeds and grow carrots!");
  }
  drawScene();
  gameLoop();
  maybeShowPrereleaseOverlay();
}

function beginPlaySession() {
  if (bootSequenceStarted) return;
  bootSequenceStarted = true;
  loadingFinished = false;
  const bootGate = document.getElementById("bootGate");
  const loadingScreen = document.getElementById("loadingScreen");
  const loadingTipEl = document.getElementById("loadingTip");
  if (bootGate) {
    bootGate.classList.add("hidden");
    bootGate.setAttribute("aria-hidden", "true");
  }
  if (loadingTipEl && LOADING_TIPS.length > 0) {
    loadingTipEl.textContent = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
  }
  if (loadingScreen) {
    loadingScreen.classList.remove("hidden");
    loadingScreen.setAttribute("aria-hidden", "false");
  }
  loadingFinishTimeoutId = window.setTimeout(() => {
    loadingFinishTimeoutId = null;
    finishLoadingAndStartGame();
  }, LOADING_SCREEN_MS);
}

const bootGateEl = document.getElementById("bootGate");
if (bootGateEl) {
  bootGateEl.addEventListener("click", beginPlaySession);
  bootGateEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      beginPlaySession();
    }
  });
}

const loadingScreenEl = document.getElementById("loadingScreen");
if (loadingScreenEl) {
  loadingScreenEl.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (bootSequenceStarted && !loadingFinished) {
      finishLoadingAndStartGame();
    }
  });
  loadingScreenEl.addEventListener("pointerdown", (event) => {
    if (event.button === 2) {
      event.preventDefault();
      if (bootSequenceStarted && !loadingFinished) {
        finishLoadingAndStartGame();
      }
    }
  });
}
