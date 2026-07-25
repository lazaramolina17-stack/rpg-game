// src/web/renderer.ts
import * as THREE3 from "three";

// src/web/three-scene.ts
import * as THREE from "three";
function initScene(canvas) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(988970, 30, 60);
  const camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1, 0);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(988970);
  const ambientLight = new THREE.AmbientLight(4210784, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(16772829, 1.2);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 5929562, roughness: 0.8, metalness: 0.1 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  function handleResize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", handleResize);
  handleResize();
  return { scene, camera, renderer, ambientLight, directionalLight, ground };
}

// src/web/three-models.ts
import * as THREE2 from "three";
function createTileMesh(tileType, _seed) {
  const colorMap = {
    0: 4885562,
    1: 1985050,
    2: 2450411,
    3: 9083565,
    4: 12886629
  };
  const color = colorMap[tileType] ?? 4885562;
  const geo = new THREE2.BoxGeometry(1, 0.15, 1);
  const mat = new THREE2.MeshStandardMaterial({ color, roughness: 0.9 });
  const mesh = new THREE2.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}
function createPlayerModel() {
  const g = new THREE2.Group();
  const skinMat = new THREE2.MeshStandardMaterial({ color: 16639626, roughness: 0.5 });
  const bodyMat = new THREE2.MeshStandardMaterial({ color: 8141549, roughness: 0.6 });
  const body = new THREE2.Mesh(new THREE2.BoxGeometry(0.5, 0.6, 0.3), bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  g.add(body);
  const headMat = new THREE2.MeshStandardMaterial({ color: 16639626, roughness: 0.5 });
  const head = new THREE2.Mesh(new THREE2.SphereGeometry(0.22, 8, 8), headMat);
  head.position.y = 0.95;
  head.castShadow = true;
  g.add(head);
  const armMat = new THREE2.MeshStandardMaterial({ color: 8141549, roughness: 0.6 });
  const armGeo = new THREE2.CylinderGeometry(0.06, 0.07, 0.35, 6);
  const leftArm = new THREE2.Mesh(armGeo, armMat);
  leftArm.position.set(-0.35, 0.7, 0);
  leftArm.rotation.z = 0.15;
  g.add(leftArm);
  const rightArm = new THREE2.Mesh(armGeo, armMat);
  rightArm.position.set(0.35, 0.7, 0);
  rightArm.rotation.z = -0.15;
  g.add(rightArm);
  const handMat = new THREE2.MeshStandardMaterial({ color: 16639626, roughness: 0.5 });
  const handGeo = new THREE2.SphereGeometry(0.07, 6, 6);
  const leftHand = new THREE2.Mesh(handGeo, handMat);
  leftHand.position.set(-0.35, 0.5, 0);
  g.add(leftHand);
  const rightHand = new THREE2.Mesh(handGeo, handMat);
  rightHand.position.set(0.35, 0.5, 0);
  g.add(rightHand);
  const swordMat = new THREE2.MeshStandardMaterial({ color: 9741240, metalness: 0.5, roughness: 0.3 });
  const sword = new THREE2.Mesh(new THREE2.BoxGeometry(0.04, 0.3, 0.02), swordMat);
  sword.position.set(0.35, 0.7, 0);
  sword.rotation.z = -0.3;
  g.add(sword);
  return g;
}
function createEnemyModel(name) {
  const g = new THREE2.Group();
  const color = name.includes("Boss") ? 14427686 : name.includes("Skeleton") ? 14870768 : name.includes("Mage") ? 3900150 : name.includes("Goblin") ? 2278750 : 9136404;
  const bodyMat = new THREE2.MeshStandardMaterial({ color, roughness: 0.7 });
  const body = new THREE2.Mesh(new THREE2.BoxGeometry(0.5, 0.6, 0.3), bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  g.add(body);
  const headMat = new THREE2.MeshStandardMaterial({ color: name.includes("Skeleton") ? 16317180 : 16557477, roughness: 0.5 });
  const head = new THREE2.Mesh(new THREE2.SphereGeometry(0.2, 8, 8), headMat);
  head.position.y = 0.95;
  head.castShadow = true;
  g.add(head);
  const armMat = new THREE2.MeshStandardMaterial({ color, roughness: 0.7 });
  const armGeo = new THREE2.CylinderGeometry(0.05, 0.06, 0.3, 5);
  const leftArm = new THREE2.Mesh(armGeo, armMat);
  leftArm.position.set(-0.34, 0.65, 0);
  leftArm.rotation.z = 0.2;
  g.add(leftArm);
  const rightArm = new THREE2.Mesh(armGeo, armMat);
  rightArm.position.set(0.34, 0.65, 0);
  rightArm.rotation.z = -0.2;
  g.add(rightArm);
  const handMat = new THREE2.MeshStandardMaterial({ color: name.includes("Skeleton") ? 16317180 : 16557477, roughness: 0.5 });
  const handGeo = new THREE2.SphereGeometry(0.06, 4, 4);
  const leftHand = new THREE2.Mesh(handGeo, handMat);
  leftHand.position.set(-0.34, 0.47, 0);
  g.add(leftHand);
  const rightHand = new THREE2.Mesh(handGeo, handMat);
  rightHand.position.set(0.34, 0.47, 0);
  g.add(rightHand);
  return g;
}
function createNPCModel(name) {
  const g = new THREE2.Group();
  const colorMap = {
    Merchant: 2278750,
    Guard: 3900150,
    Elder: 7041664,
    Blacksmith: 16347926,
    Farmer: 9136404
  };
  const color = colorMap[name] ?? 2278750;
  const bodyMat = new THREE2.MeshStandardMaterial({ color, roughness: 0.7 });
  const body = new THREE2.Mesh(new THREE2.BoxGeometry(0.5, 0.6, 0.3), bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  g.add(body);
  const headMat = new THREE2.MeshStandardMaterial({ color: 16639626, roughness: 0.5 });
  const head = new THREE2.Mesh(new THREE2.SphereGeometry(0.2, 8, 8), headMat);
  head.position.y = 0.95;
  head.castShadow = true;
  g.add(head);
  const armMat = new THREE2.MeshStandardMaterial({ color: 13935988, roughness: 0.7 });
  const armGeo = new THREE2.CylinderGeometry(0.05, 0.06, 0.3, 5);
  const leftArm = new THREE2.Mesh(armGeo, armMat);
  leftArm.position.set(-0.34, 0.65, 0);
  leftArm.rotation.z = 0.2;
  g.add(leftArm);
  const rightArm = new THREE2.Mesh(armGeo, armMat);
  rightArm.position.set(0.34, 0.65, 0);
  rightArm.rotation.z = -0.2;
  g.add(rightArm);
  const handMat = new THREE2.MeshStandardMaterial({ color: 16639626, roughness: 0.5 });
  const handGeo = new THREE2.SphereGeometry(0.06, 4, 4);
  const leftHand = new THREE2.Mesh(handGeo, handMat);
  leftHand.position.set(-0.34, 0.47, 0);
  g.add(leftHand);
  const rightHand = new THREE2.Mesh(handGeo, handMat);
  rightHand.position.set(0.34, 0.47, 0);
  g.add(rightHand);
  return g;
}
function createItemModel(_itemType) {
  const mat = new THREE2.MeshStandardMaterial({ color: 16498468, emissive: 16498468, emissiveIntensity: 0.3 });
  const mesh = new THREE2.Mesh(new THREE2.SphereGeometry(0.15, 8, 8), mat);
  mesh.castShadow = true;
  return mesh;
}

// src/web/dnd.ts
function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}
function rollDice(count, sides) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides));
  }
  return results;
}
function rollD20() {
  return rollDie(20);
}
function rollWithAdvantage() {
  const r1 = rollD20();
  const r2 = rollD20();
  return [r1, r2, Math.max(r1, r2)];
}
function getModifier(score) {
  return Math.floor((score - 10) / 2);
}
var RACIAL_BONUSES = {
  Human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
  Elf: { dexterity: 2 },
  Dwarf: { constitution: 2 },
  Halfling: { dexterity: 2 },
  Dragonborn: { strength: 2, charisma: 1 },
  HalfElf: { charisma: 2 }
};
function applyRacialBonuses(attrs, race) {
  const bonuses = RACIAL_BONUSES[race];
  if (!bonuses) return { ...attrs };
  const result = { ...attrs };
  const keys = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
  for (const key of keys) {
    const bonus = bonuses[key];
    if (bonus) {
      result[key] += bonus;
    }
  }
  return result;
}
var RACES = [
  {
    id: "human",
    name: "Human",
    description: "Vers\xE1tiles y ambiciosos, los humanos son la raza m\xE1s adaptable.",
    attributeBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    speed: 1,
    size: "Medium",
    traits: ["Versatile: +1 a todos los atributos", "Extra Language: Common +1"]
  },
  {
    id: "elf",
    name: "Elf",
    description: "Seres gr\xE1ciles y longevos con agudos sentidos y conexi\xF3n con la naturaleza.",
    attributeBonuses: { dexterity: 2 },
    speed: 1.05,
    size: "Medium",
    traits: ["Darkvision: Visi\xF3n en oscuridad 60ft", "Keen Senses: Percepci\xF3n competente", "Fey Ancestry: Ventaja contra encantos", "Trance: Meditar 4h equivale a dormir 8h"]
  },
  {
    id: "dwarf",
    name: "Dwarf",
    description: "Guerreros robustos y resistentes, forjados en las profundidades de la monta\xF1a.",
    attributeBonuses: { constitution: 2 },
    speed: 0.9,
    size: "Medium",
    traits: ["Darkvision: Visi\xF3n en oscuridad 60ft", "Dwarven Resilience: Resistencia al veneno", "Stonecunning: Competencia en historia de piedra"]
  },
  {
    id: "halfling",
    name: "Halfling",
    description: "Peque\xF1os y afortunados, los halflings son sorprendentemente valientes.",
    attributeBonuses: { dexterity: 2 },
    speed: 0.9,
    size: "Small",
    traits: ["Lucky: Puedes repetir 1 natural en ataques/pruebas/salvaciones", "Brave: Ventaja contra miedo", "Nimble: Puedes moverte a trav\xE9s de criaturas m\xE1s grandes"]
  },
  {
    id: "dragonborn",
    name: "Dragonborn",
    description: "Descendientes de dragones, con escamas y aliento elemental.",
    attributeBonuses: { strength: 2, charisma: 1 },
    speed: 1,
    size: "Medium",
    traits: ["Breath Weapon: Ataque de aliento elemental", "Damage Resistance: Resistencia al tipo de da\xF1o de tu ascendencia"]
  },
  {
    id: "halfelf",
    name: "Half-Elf",
    description: "Mezcla de sangre humana y \xE9lfica, heredan lo mejor de ambos mundos.",
    attributeBonuses: { charisma: 2 },
    speed: 1.05,
    size: "Medium",
    traits: ["Darkvision: Visi\xF3n en oscuridad 60ft", "Fey Ancestry: Ventaja contra encantos", "Skill Versatility: Dos habilidades adicionales", "Extra Language: Common +1"]
  }
];
var CLASSES = [
  {
    id: "fighter",
    name: "Fighter",
    description: "Maestro del combate armado, experto en t\xE1cticas de guerra.",
    hitDie: 10,
    primaryAbility: "strength",
    savingThrowProficiencies: ["strength", "constitution"],
    features: [
      { name: "Fighting Style", description: "Elige un estilo de combate: arquer\xEDa, defensa, duelo, etc.", level: 1 },
      { name: "Second Wind", description: "Una vez por descanso, recupera 1d10 + nivel de HP como acci\xF3n adicional.", level: 1 },
      { name: "Action Surge", description: "Una vez por descanso, toma una acci\xF3n adicional en tu turno.", level: 2 },
      { name: "Combat Superiority", description: "Obtienes maniobras de combate y dados de superioridad.", level: 3 },
      { name: "Extra Attack", description: "Puedes atacar dos veces cuando tomas la acci\xF3n de Ataque.", level: 5 }
    ]
  },
  {
    id: "wizard",
    name: "Wizard",
    description: "Erudito de la magia arcana que lanza hechizos a trav\xE9s de su libro de conjuros.",
    hitDie: 6,
    primaryAbility: "intelligence",
    savingThrowProficiencies: ["intelligence", "wisdom"],
    features: [
      { name: "Spellcasting", description: "Lanzas hechizos arcanos usando tu libro de conjuros.", level: 1 },
      { name: "Arcane Recovery", description: "Una vez al d\xEDa, recuperas niveles de conjuros gastados tras un descanso corto.", level: 1 },
      { name: "Arcane Tradition", description: "Elige una escuela de magia: evocaci\xF3n, abjuraci\xF3n, etc.", level: 2 },
      { name: "Cantrip Formulas", description: "Puedes preparar cantrips adicionales de tu libro.", level: 3 },
      { name: "Spell Mastery", description: "Dominas un conjuro de nivel 1 y uno de nivel 2 que puedes lanzar sin gastar espacio.", level: 5 }
    ]
  },
  {
    id: "rogue",
    name: "Rogue",
    description: "Ladr\xF3n y asesino h\xE1bil, experto en sigilo, trampas y golpes precisos.",
    hitDie: 8,
    primaryAbility: "dexterity",
    savingThrowProficiencies: ["dexterity", "intelligence"],
    features: [
      { name: "Sneak Attack", description: "Ataque furtivo: +1d6 de da\xF1o una vez por turno con ventaja o aliado cercano.", level: 1 },
      { name: "Thieves Cant", description: "Lenguaje secreto de ladrones con se\xF1ales y c\xF3digos ocultos.", level: 1 },
      { name: "Cunning Action", description: "Acci\xF3n astuta: puede usar Correr, Retirarse o Esconderse como acci\xF3n adicional.", level: 2 },
      { name: "Steady Aim", description: "Como acci\xF3n adicional, obtienes ventaja en tu siguiente ataque a distancia.", level: 3 },
      { name: "Uncanny Dodge", description: "Cuando un atacante que ves te impacta, reduces el da\xF1o a la mitad con tu reacci\xF3n.", level: 5 }
    ]
  },
  {
    id: "cleric",
    name: "Cleric",
    description: "Campe\xF3n divino que canaliza el poder de los dioses para sanar y proteger.",
    hitDie: 8,
    primaryAbility: "wisdom",
    savingThrowProficiencies: ["wisdom", "charisma"],
    features: [
      { name: "Spellcasting", description: "Lanzas hechizos divinos canalizando el poder de tu deidad.", level: 1 },
      { name: "Divine Domain", description: "Elige un dominio divino que otorga hechizos y habilidades adicionales.", level: 1 },
      { name: "Channel Divinity", description: "Canalizas energ\xEDa divina una vez por descanso para efectos sagrados.", level: 2 },
      { name: "Destroy Undead", description: "Tu Channel Divinity puede destruir no-muertos de CR menor a tu nivel.", level: 3 },
      { name: "Divine Intervention", description: "Imploras la intervenci\xF3n directa de tu deidad una vez cada 7 d\xEDas.", level: 5 }
    ]
  },
  {
    id: "ranger",
    name: "Ranger",
    description: "Explorador y cazador, rastrea bestias y protege las fronteras de la civilizaci\xF3n.",
    hitDie: 10,
    primaryAbility: "dexterity",
    savingThrowProficiencies: ["strength", "dexterity"],
    features: [
      { name: "Favored Foe", description: "Marca a un enemigo como presa favorita, a\xF1adiendo 1d4 de da\xF1o una vez por turno.", level: 1 },
      { name: "Spellcasting", description: "Lanzas hechizos de ranger relacionados con la naturaleza y la caza.", level: 2 },
      { name: "Ranger Archetype", description: "Elige un arquetipo: cazador, guardabosques o domador de bestias.", level: 3 },
      { name: "Primeval Awareness", description: "Puedes detectar criaturas sobrenaturales en un radio de 1 milla.", level: 3 },
      { name: "Extra Attack", description: "Puedes atacar dos veces cuando tomas la acci\xF3n de Ataque.", level: 5 }
    ]
  },
  {
    id: "paladin",
    name: "Paladin",
    description: "Guerrero sagrado que jura defender la justicia y destruir el mal.",
    hitDie: 10,
    primaryAbility: "strength",
    savingThrowProficiencies: ["wisdom", "charisma"],
    features: [
      { name: "Lay on Hands", description: "Toque sanador: tienes un pozo de HP \xD7 5 puntos de curaci\xF3n para distribuir.", level: 1 },
      { name: "Divine Sense", description: "Puedes detectar presencias celestiales, infernales o no-muertas.", level: 1 },
      { name: "Divine Smite", description: "Gasta un espacio de conjuro al golpear para a\xF1adir da\xF1o radiante: 2d8 + 1d8 por nivel.", level: 2 },
      { name: "Sacred Oath", description: "Juras un juramento sagrado que otorga poderes y hechizos de juramento.", level: 3 },
      { name: "Extra Attack", description: "Puedes atacar dos veces cuando tomas la acci\xF3n de Ataque.", level: 5 }
    ]
  }
];
function getProficiencyBonus(level) {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}
var SPELL_SLOTS_BY_LEVEL = {
  1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  3: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  4: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  5: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  6: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  7: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  8: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  9: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
  10: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  11: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
  12: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
  13: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
  14: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
  15: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
  16: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
  17: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 1 },
  18: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 1, level7: 1, level8: 1, level9: 1 },
  19: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 1, level8: 1, level9: 1 },
  20: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 2, level8: 1, level9: 1 }
};
function getSpellSlots(level, cls) {
  const casterClasses = ["wizard", "cleric", "paladin", "ranger"];
  if (!casterClasses.includes(cls)) {
    return { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 };
  }
  if (cls === "paladin" || cls === "ranger") {
    const halfLevel = Math.ceil(level / 2);
    return SPELL_SLOTS_BY_LEVEL[halfLevel] ?? { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 };
  }
  return SPELL_SLOTS_BY_LEVEL[level] ?? { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 };
}
function computeModifiers(attrs) {
  return {
    strength: getModifier(attrs.strength),
    dexterity: getModifier(attrs.dexterity),
    constitution: getModifier(attrs.constitution),
    intelligence: getModifier(attrs.intelligence),
    wisdom: getModifier(attrs.wisdom),
    charisma: getModifier(attrs.charisma)
  };
}
function computeMaxHp(hitDie, level, conMod) {
  return hitDie + conMod + (level - 1) * (Math.floor(hitDie / 2) + 1 + conMod);
}
function createCharacter(name, race, cls, attrs) {
  const level = 1;
  const bonuses = race.attributeBonuses;
  const finalAttrs = applyRacialBonuses(attrs, race.name);
  const modifiers = computeModifiers(finalAttrs);
  const conMod = modifiers.constitution;
  const profBonus = getProficiencyBonus(level);
  const maxHp = computeMaxHp(cls.hitDie, level, conMod);
  const spellSlots = getSpellSlots(level, cls.id);
  const dexMod = modifiers.dexterity;
  return {
    name,
    race,
    class: cls,
    level,
    attributes: finalAttrs,
    modifiers,
    hitPoints: maxHp,
    maxHitPoints: maxHp,
    hitDie: cls.hitDie,
    hitDieCurrent: level,
    proficiencyBonus: profBonus,
    speed: race.speed,
    features: cls.features.filter((f) => f.level <= level),
    spellSlots,
    armorClass: 10 + dexMod,
    initiative: dexMod,
    inspiration: false
  };
}

// src/web/renderer.ts
var TILE = 32;
var TILEMAP = (() => {
  const chars = [
    "gggggggggggggggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg",
    "gggggtttttgggggggggggtttttgggggg",
    "ggggtgggggtgggggggggtgggggtggggg",
    "ggggtgggggtgggggggggtgggggtggggg",
    "gggggtttttgggggggggggtttttgggggg",
    "ggggggggggwggggggggggggggggggggg",
    "ggggggggggwggggggggggggggggggggg",
    "ggggggggggsssggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg",
    "ggggddddggggggggggggdddddggggggg",
    "ggggddddggggggggggggdddddggggggg",
    "gggggggggggggggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg"
  ];
  const map = { g: 0, t: 1, w: 2, s: 3, d: 4 };
  return chars.map((r) => [...r].map((c) => map[c] ?? 0));
})();
var Renderer = class {
  constructor(canvas) {
    this.canvas = canvas;
    const threeCanvas = document.createElement("canvas");
    threeCanvas.style.position = "absolute";
    threeCanvas.style.top = "0";
    threeCanvas.style.left = "0";
    threeCanvas.style.width = "100%";
    threeCanvas.style.height = "100%";
    threeCanvas.style.display = "block";
    const container = document.getElementById("game-container") || document.body;
    if (container.style.position !== "absolute" && container.style.position !== "relative") {
      container.style.position = "relative";
    }
    container.insertBefore(threeCanvas, canvas);
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none";
    this.overlayCtx = canvas.getContext("2d");
    const init = initScene(threeCanvas);
    this.scene = init.scene;
    this.threeCamera = new THREE3.PerspectiveCamera(70, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 100);
    this.threeCamera.position.set(0, 1.5, 0);
    this.threeCamera.lookAt(0, 0, -1);
    this.threeRenderer = init.renderer;
    init.ground.visible = false;
    this.sharedParticleGeo = new THREE3.SphereGeometry(0.08, 6, 6);
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }
  canvas;
  overlayCtx;
  scene;
  threeCamera;
  threeRenderer;
  cameraState = { x: 0, y: 0, zoom: 1 };
  entities = [];
  particles3D = [];
  projectileMeshes = [];
  tileMeshMap = /* @__PURE__ */ new Map();
  entityModelMap = /* @__PURE__ */ new Map();
  screenFlash = 0;
  levelUpText = 0;
  levelUpY = 0;
  time = 0;
  fps = 0;
  frameCount = 0;
  lastFpsTime = 0;
  sharedParticleGeo;
  hud = null;
  damageTexts = [];
  showVictory = false;
  gameOver = false;
  minimapVisible = false;
  yaw = 0;
  pitch = 0;
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.threeCamera.aspect = this.canvas.width / this.canvas.height;
    this.threeCamera.updateProjectionMatrix();
  }
  getCtx() {
    return this.overlayCtx;
  }
  setCamera(cam) {
    Object.assign(this.cameraState, cam);
    this.updateThreeCamera();
  }
  getCamera() {
    return this.cameraState;
  }
  setEntities(es) {
    this.entities = es;
  }
  toggleMinimap(visible) {
    this.minimapVisible = visible;
  }
  charCreationState = null;
  setCharCreationState(state) {
    this.charCreationState = state;
  }
  drawCharacterCreation(ctx, w, h) {
    const state = this.charCreationState;
    if (!state) return;
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("D&D Character Creation", w / 2, 60);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "14px sans-serif";
    ctx.fillText("Welcome, adventurer! Create your hero.", w / 2, 90);
    if (state.phase === "race") {
      ctx.fillStyle = "#a855f7";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("Choose Your Race", w / 2, 140);
      for (let i = 0; i < RACES.length; i++) {
        const r = RACES[i];
        const y = 180 + i * 75;
        ctx.fillStyle = i === state.raceIndex ? "#fbbf24" : "#94a3b8";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(r.name, 120, y);
        ctx.fillStyle = "#64748b";
        ctx.font = "12px sans-serif";
        ctx.fillText(r.description, 120, y + 18);
        const bonusParts = Object.entries(r.attributeBonuses).map(([k, v]) => `${k.slice(0, 3).toUpperCase()}+${v}`);
        ctx.fillStyle = "#34d399";
        ctx.font = "11px sans-serif";
        ctx.fillText(bonusParts.join("  "), 120, y + 36);
        ctx.fillStyle = "#475569";
        ctx.font = "10px sans-serif";
        ctx.fillText(r.traits.join(" | "), 120, y + 52);
        if (i === state.raceIndex) {
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(90, y - 8, 4, 60);
        }
      }
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText("\u2191\u2193 Navigate  [Space] Select", w / 2, h - 30);
    } else if (state.phase === "class") {
      ctx.fillStyle = "#3b82f6";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("Choose Your Class", w / 2, 140);
      for (let i = 0; i < CLASSES.length; i++) {
        const c = CLASSES[i];
        const y = 180 + i * 65;
        ctx.fillStyle = i === state.classIndex ? "#fbbf24" : "#94a3b8";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(c.name, 120, y);
        ctx.fillStyle = "#64748b";
        ctx.font = "12px sans-serif";
        ctx.fillText(c.description, 120, y + 18);
        ctx.fillStyle = "#f59e0b";
        ctx.font = "11px sans-serif";
        ctx.fillText(`HD: d${c.hitDie}  Primary: ${c.primaryAbility}  Saves: ${c.savingThrowProficiencies.join(", ")}`, 120, y + 36);
        if (i === state.classIndex) {
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(90, y - 8, 4, 50);
        }
      }
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText("\u2191\u2193 Navigate  [Space] Select", w / 2, h - 30);
    } else if (state.phase === "attributes") {
      const attrNames = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("Assign Attributes", w / 2, 140);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText("Place each value: 15, 14, 13, 12, 10, 8", w / 2, 165);
      for (let i = 0; i < attrNames.length; i++) {
        const y = 200 + i * 48;
        ctx.fillStyle = i === state.attrIndex ? "#fbbf24" : "#e2e8f0";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(attrNames[i], w / 2 - 20, y);
        ctx.textAlign = "left";
        ctx.fillStyle = i < state.attrs.length ? "#34d399" : "#475569";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(i < state.attrs.length ? String(state.attrs[i]) : "--", w / 2 + 10, y);
        if (i === state.attrIndex) {
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(w / 2 - 30, y - 18, 4, 22);
        }
      }
      if (state.attrs.length < 6) {
        const remaining = [15, 14, 13, 12, 10, 8];
        for (const a of state.attrs) {
          const idx = remaining.indexOf(a);
          if (idx >= 0) remaining.splice(idx, 1);
        }
        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Select value: [${remaining.join("] [")}]  [B]ack`, w / 2, h - 30);
      } else {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("[Space] Confirm  [B]ack", w / 2, h - 30);
      }
    } else if (state.phase === "confirm") {
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("Confirm Character", w / 2, 140);
      const race = RACES[state.raceIndex];
      const cls = CLASSES[state.classIndex];
      const attrNames = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${race.name} ${cls.name}`, w / 2, 180);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px sans-serif";
      ctx.fillText(`${cls.description}`, w / 2, 205);
      for (let i = 0; i < attrNames.length; i++) {
        const x = w / 2 - 150 + i * 60;
        ctx.fillStyle = "#64748b";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(attrNames[i], x, 245);
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(String(state.attrs[i]), x, 268);
        ctx.fillStyle = "#475569";
        ctx.font = "10px sans-serif";
        ctx.fillText(`mod ${getModifier(state.attrs[i] >= 0 ? state.attrs[i] : 10)}`, x, 283);
      }
      ctx.fillStyle = "#a855f7";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`HP: ${cls.hitDie} + CON  AC: ${10 + getModifier(state.attrs[1])}  Speed: ${race.speed}`, w / 2, 315);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText("[Space] Begin Adventure!  [B]ack", w / 2, h - 30);
    }
  }
  addParticles(x, y, color, count = 8) {
    const wx = x / 32, wz = y / 32;
    const colorObj = new THREE3.Color(color);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (30 + Math.random() * 60) / 32;
      const mesh = new THREE3.Mesh(this.sharedParticleGeo, new THREE3.MeshBasicMaterial({ color: colorObj }));
      mesh.position.set(wx, 0.3, wz);
      this.scene.add(mesh);
      this.particles3D.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vz: Math.sin(angle) * speed,
        vy: 0.5 + Math.random() * 1.5,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5
      });
    }
  }
  flashScreen() {
    this.screenFlash = 0.15;
  }
  showLevelUp(x) {
    this.levelUpText = 2;
    this.levelUpY = x;
  }
  render(time, dt) {
    this.time = time;
    this.updateThreeCamera();
    this.updateTileMeshes();
    this.updateEntityMeshes(time);
    this.updateParticles3D(dt);
    this.updateProjectiles(time);
    this.threeRenderer.render(this.scene, this.threeCamera);
    const ctx = this.overlayCtx, w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (this.charCreationState) {
      this.drawCharacterCreation(ctx, w, h);
    } else {
      this.drawHpBars(ctx);
      this.drawHUD(ctx, w, h);
      this.drawDamageTexts(ctx);
      this.drawDiceRoll(ctx, w, h);
      if (this.screenFlash > 0) {
        ctx.fillStyle = `rgba(255,0,0,${this.screenFlash * 0.3})`;
        ctx.fillRect(0, 0, w, h);
        this.screenFlash -= dt;
      }
      if (this.levelUpText > 0) {
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("LEVEL UP!", w / 2, this.levelUpY);
        this.levelUpText -= dt;
      }
      this.drawDebug(ctx);
      if (this.gameOver) this.drawGameOver(ctx, w, h);
      if (this.showVictory) this.drawVictory(ctx, w, h);
      if (this.minimapVisible) this.drawMinimap(ctx, w, h, this.cameraState);
    }
    this.drawCrosshair(ctx, w, h);
    this.frameCount++;
    if (time - this.lastFpsTime >= 1e3) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = time;
    }
  }
  updateThreeCamera() {
    const cam = this.cameraState;
    const worldX = cam.x / 32, worldZ = cam.y / 32;
    this.threeCamera.position.set(worldX, 1, worldZ);
    const dir = new THREE3.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    );
    this.threeCamera.lookAt(this.threeCamera.position.clone().add(dir));
  }
  updateTileMeshes() {
    const cam = this.cameraState, w = this.canvas.width, h = this.canvas.height;
    const sx = Math.max(0, Math.floor((cam.x - w / 2) / TILE) - 1);
    const sy = Math.max(0, Math.floor((cam.y - h / 2) / TILE) - 1);
    const ex = Math.min(TILEMAP[0].length, Math.ceil((cam.x + w / 2) / TILE) + 1);
    const ey = Math.min(TILEMAP.length, Math.ceil((cam.y + h / 2) / TILE) + 1);
    const visibleKeys = /* @__PURE__ */ new Set();
    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        const key = `${x},${y}`;
        visibleKeys.add(key);
        if (this.tileMeshMap.has(key)) continue;
        const tile = TILEMAP[y]?.[x] ?? 0;
        const mesh = createTileMesh(tile, x * 100 + y);
        mesh.position.set(x, 0.075, y);
        this.scene.add(mesh);
        this.tileMeshMap.set(key, mesh);
      }
    }
    for (const [key, mesh] of this.tileMeshMap) {
      if (!visibleKeys.has(key)) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.tileMeshMap.delete(key);
      }
    }
  }
  updateEntityMeshes(time) {
    const currentKeys = /* @__PURE__ */ new Set();
    const es = this.entities;
    for (let i = 0; i < es.length; i++) {
      const e = es[i];
      const key = `${i}_${e.type}_${e.name}`;
      currentKeys.add(key);
      let model = this.entityModelMap.get(key);
      if (!model) {
        if (e.type === "player") model = createPlayerModel();
        else if (e.type === "npc") model = createNPCModel(e.name);
        else if (e.type === "enemy") model = createEnemyModel(e.name);
        else if (e.type === "item") {
          const m = createItemModel(e.itemType);
          model = new THREE3.Group();
          model.add(m);
        } else {
          model = createEnemyModel(e.name);
        }
        this.entityModelMap.set(key, model);
        this.scene.add(model);
      }
      const wx = e.x / 32, wz = e.y / 32;
      model.position.set(wx, 0, wz);
      const bob = e.type === "player" || e.type === "npc" || e.type === "enemy" ? Math.sin(time * 3e-3 * 3 + e.x * 0.1) * 0.1 : 0;
      model.position.y += bob;
      if (e.type === "player") {
        model.rotation.y = 0;
      } else if (e.type === "enemy") {
        model.rotation.y = 0;
      }
      const alive = e.hp !== void 0 ? e.hp > 0 : true;
      model.visible = alive;
      if (e.type === "player") model.visible = false;
    }
    for (const [key, model] of this.entityModelMap) {
      if (!currentKeys.has(key)) {
        this.scene.remove(model);
        model.traverse((child) => {
          if (child instanceof THREE3.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
        this.entityModelMap.delete(key);
      }
    }
  }
  updateParticles3D(dt) {
    for (let i = this.particles3D.length - 1; i >= 0; i--) {
      const p = this.particles3D[i];
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.z += p.vz * dt;
      p.mesh.position.y += p.vy * dt;
      p.vy -= 2.5 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles3D.splice(i, 1);
      } else {
        const alpha = Math.max(0, p.life / p.maxLife);
        p.mesh.material.opacity = alpha;
        p.mesh.material.transparent = true;
        const s = 0.5 + alpha * 0.5;
        p.mesh.scale.setScalar(s);
      }
    }
  }
  updateProjectiles(time) {
    for (const m of this.projectileMeshes) {
      this.scene.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    }
    this.projectileMeshes = [];
  }
  getCenterTarget() {
    const raycaster = new THREE3.Raycaster();
    raycaster.setFromCamera(new THREE3.Vector2(0, 0), this.threeCamera);
    const meshToKey = /* @__PURE__ */ new Map();
    const targets = [];
    for (const [key, model] of this.entityModelMap) {
      model.traverse((child) => {
        if (child instanceof THREE3.Mesh) {
          targets.push(child);
          meshToKey.set(child, key);
        }
      });
    }
    const intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const key = meshToKey.get(hit);
      if (key) {
        const idx = parseInt(key.split("_")[0]);
        if (idx >= 0 && idx < this.entities.length) {
          return this.entities[idx];
        }
      }
    }
    return null;
  }
  drawCrosshair(ctx, w, h) {
    const cx = w / 2, cy = h / 2;
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx - 4, cy);
    ctx.moveTo(cx + 4, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy - 4);
    ctx.moveTo(cx, cy + 4);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.stroke();
  }
  drawHpBars(ctx) {
    const cam = this.cameraState;
    ctx.save();
    ctx.translate(this.canvas.width / 2 - cam.x, this.canvas.height / 2 - cam.y);
    for (const e of this.entities) {
      if (e.hp !== void 0 && e.maxHp !== void 0 && e.maxHp > 0 && e.hp > 0) {
        const bw = 28, bh = 4, bx = e.x - bw / 2, by = e.y - 22;
        ctx.fillStyle = "#374151";
        ctx.fillRect(bx, by, bw, bh);
        const ratio = Math.max(0, (e.hp ?? 0) / e.maxHp);
        ctx.fillStyle = ratio < 0.3 ? "#ef4444" : ratio < 0.6 ? "#f59e0b" : "#34d399";
        ctx.fillRect(bx, by, bw * ratio, bh);
        ctx.strokeStyle = "#1e293b";
        ctx.strokeRect(bx, by, bw, bh);
      }
    }
    ctx.restore();
  }
  drawDiceRoll(ctx, w, h) {
    const lastRoll = this.hud?.lastDiceRoll;
    if (!lastRoll) return;
    const x = w / 2, y = h / 2 + 60;
    ctx.fillStyle = "rgba(15,23,42,0.9)";
    this.roundRect(ctx, x - 80, y - 18, 160, 36, 8);
    const typeLabel = lastRoll.type === "advantage" ? " Adv" : lastRoll.type === "disadvantage" ? " Dis" : "";
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`d20${typeLabel}: ${lastRoll.rolls.join(" + ")} = ${lastRoll.total}`, x, y + 4);
  }
  drawDamageTexts(ctx) {
    const cam = this.cameraState, w = this.canvas.width, h = this.canvas.height;
    for (const d of this.damageTexts) {
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 3;
      ctx.fillText(d.text, d.x - cam.x + w / 2, d.y - cam.y + h / 2);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }
  drawHUD(ctx, w, h) {
    const hud = this.hud;
    if (!hud) return;
    const px = 12, py = 12, pw = 220, ph = 100;
    ctx.fillStyle = "rgba(15,23,42,0.85)";
    this.roundRect(ctx, px, py, pw, ph, 8);
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 1;
    this.roundRect(ctx, px, py, pw, ph, 8);
    const bar = (label, val, max, y, color) => {
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, px + 10, y + 10);
      const bw = 120, bh = 10, bx = px + 70, by = y;
      ctx.fillStyle = "#374151";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = color;
      ctx.fillRect(bx, by, bw * Math.min(val / max, 1), bh);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(val)}/${Math.round(max)}`, bx + bw / 2, by + 9);
    };
    bar(`Lv${hud.level}`, hud.hp, hud.maxHp, py + 8, "#34d399");
    bar("MP", hud.mana, hud.maxMana, py + 26, "#3b82f6");
    bar("XP", hud.xp, hud.xpToNext, py + 44, "#a855f7");
    ctx.fillStyle = "#fbbf24";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${hud.gold} gold`, px + 10, py + 72);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText(`FPS:${this.fps} En:${this.entities.length}`, px + 10, py + 90);
    if (hud.inventory.some((s) => s !== null)) {
      const ix = px, iy = py + ph + 8;
      ctx.fillStyle = "rgba(15,23,42,0.85)";
      this.roundRect(ctx, ix, iy, 220, 34, 6);
      ctx.strokeStyle = "#a855f7";
      this.roundRect(ctx, ix, iy, 220, 34, 6);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("1          2          3          4", ix + 14, iy + 12);
      for (let i = 0; i < 4; i++) {
        const slot = hud.inventory[i];
        const sx = ix + 8 + i * 52, sy = iy + 16;
        ctx.fillStyle = slot ? "#1e293b" : "#0f172a";
        ctx.fillRect(sx, sy, 46, 14);
        ctx.strokeStyle = "#475569";
        ctx.strokeRect(sx, sy, 46, 14);
        if (slot) {
          ctx.fillStyle = slot.type === "health_potion" ? "#ef4444" : "#fbbf24";
          ctx.font = "9px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${slot.quantity}x`, sx + 23, sy + 11);
        }
      }
    }
    if (hud.quests.length > 0) {
      const qx = w - 230, qy = 12;
      ctx.fillStyle = "rgba(15,23,42,0.85)";
      this.roundRect(ctx, qx, qy, 220, 16 + hud.quests.length * 20, 8);
      ctx.strokeStyle = "#f59e0b";
      this.roundRect(ctx, qx, qy, 220, 16 + hud.quests.length * 20, 8);
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Quests", qx + 10, qy + 14);
      for (let i = 0; i < hud.quests.length; i++) {
        const q = hud.quests[i];
        ctx.fillStyle = q.completed ? "#34d399" : "#e2e8f0";
        ctx.font = "10px sans-serif";
        ctx.fillText(q.objective, qx + 10, qy + 32 + i * 18);
      }
    }
    if (hud.showShop && hud.shopItems) {
      const sx = w / 2 - 150, sy = h / 2 - 80;
      ctx.fillStyle = "rgba(15,23,42,0.95)";
      this.roundRect(ctx, sx, sy, 300, 160, 12);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      this.roundRect(ctx, sx, sy, 300, 160, 12);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Shop", w / 2, sy + 24);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${hud.gold} gold`, w / 2, sy + 40);
      for (let i = 0; i < hud.shopItems.length; i++) {
        const item = hud.shopItems[i];
        const iy = sy + 56 + i * 30;
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${i + 1}. ${item.name}`, sx + 16, iy);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`${item.price}`, sx + 284, iy);
        ctx.fillStyle = "#64748b";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(item.description, sx + 16, iy + 14);
      }
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("[1-3] Buy  [ESC] Exit", w / 2, sy + 148);
    }
  }
  drawGameOver(ctx, w, h) {
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 20;
    ctx.fillText("GAME OVER", w / 2, h / 2 - 30);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "18px sans-serif";
    ctx.fillText("Presiona R para reiniciar", w / 2, h / 2 + 30);
  }
  drawVictory(ctx, w, h) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "#fbbf24";
    ctx.shadowBlur = 30;
    ctx.fillText("YOU WIN!", w / 2, h / 2 - 20);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "18px sans-serif";
    ctx.fillText("Todas las quests completadas!", w / 2, h / 2 + 30);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText("Presiona R para reiniciar", w / 2, h / 2 + 60);
  }
  drawDebug(ctx) {
    const x = 12, y = this.canvas.height - 20;
    ctx.fillStyle = "rgba(15,23,42,0.7)";
    ctx.fillRect(x - 4, y - 14, 240, 18);
    ctx.fillStyle = "#475569";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("[WASD] Mov  [Space] Atk  [E] Int  [M] Mapa  [1-4]", x, y - 2);
  }
  drawMinimap(ctx, w, h, cam) {
    const mw = 140, mh = Math.round(mw * TILEMAP.length / TILEMAP[0].length);
    const mx = w - mw - 16, my = 100, ts = mw / TILEMAP[0].length;
    ctx.fillStyle = "rgba(15,23,42,0.85)";
    ctx.fillRect(mx - 4, my - 4, mw + 8, mh + 8);
    ctx.strokeStyle = "#a855f7";
    ctx.strokeRect(mx - 4, my - 4, mw + 8, mh + 8);
    for (let y = 0; y < TILEMAP.length; y++)
      for (let x = 0; x < TILEMAP[0].length; x++) {
        const tile = TILEMAP[y][x];
        ctx.fillStyle = tile === 0 ? "#3a7d32" : tile === 1 ? "#2d5a27" : tile === 2 ? "#2563eb" : tile === 3 ? "#64748b" : "#8B6914";
        ctx.fillRect(mx + x * ts, my + y * ts, ts, ts);
      }
    const viewW = w / TILE * ts, viewH = h / TILE * ts;
    const viewX = mx + (cam.x - w / 2) / TILE * ts;
    const viewY = my + (cam.y - h / 2) / TILE * ts;
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.strokeRect(viewX, viewY, viewW, viewH);
    for (const e of this.entities) {
      ctx.fillStyle = e.type === "player" ? "#a855f7" : e.type === "enemy" ? "#ef4444" : e.type === "npc" ? "#f59e0b" : "#34d399";
      ctx.beginPath();
      ctx.arc(mx + e.x / TILE * ts, my + e.y / TILE * ts, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();
  }
};

// src/web/touch.ts
var TouchController = class {
  constructor(canvas) {
    this.canvas = canvas;
    this.container = document.createElement("div");
    this.container.id = "touch-overlay";
    this.container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100";
    document.body.appendChild(this.container);
    this.joystickKnob = this.createJoystick();
    this.createButtons();
    this.initCameraLook();
  }
  canvas;
  dxVal = 0;
  dyVal = 0;
  pressed = /* @__PURE__ */ new Set();
  justPressed = /* @__PURE__ */ new Set();
  prevPressed = /* @__PURE__ */ new Set();
  container;
  joystickKnob;
  cameraDeltaX = 0;
  cameraDeltaY = 0;
  lookTouchId = null;
  lastLookX = 0;
  lastLookY = 0;
  initCameraLook() {
    const rightHalf = (tx) => tx > window.innerWidth * 0.4;
    const overlay = () => document.getElementById("touch-overlay");
    document.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      const o = overlay();
      if (o && o.contains(e.target)) return;
      if (rightHalf(t.clientX) && this.lookTouchId === null) {
        this.lookTouchId = t.identifier;
        this.lastLookX = t.clientX;
        this.lastLookY = t.clientY;
        e.preventDefault();
      }
    }, { passive: false });
    document.addEventListener("touchmove", (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.cameraDeltaX += t.clientX - this.lastLookX;
          this.cameraDeltaY += t.clientY - this.lastLookY;
          this.lastLookX = t.clientX;
          this.lastLookY = t.clientY;
          e.preventDefault();
        }
      }
    }, { passive: false });
    document.addEventListener("touchend", (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    }, { passive: false });
    document.addEventListener("touchcancel", () => {
      this.lookTouchId = null;
    }, { passive: false });
  }
  el(tag, style) {
    const e = document.createElement(tag);
    e.style.cssText = style;
    return e;
  }
  createJoystick() {
    const base = this.el("div", `
      position:fixed;bottom:24px;left:24px;width:140px;height:140px;
      border-radius:50%;background:rgba(15,23,42,0.6);border:3px solid rgba(168,85,247,0.7);
      pointer-events:auto;touch-action:none;z-index:101;
    `);
    const knob = this.el("div", `
      position:absolute;top:50%;left:50%;width:50px;height:50px;
      border-radius:50%;background:radial-gradient(circle,#c084fc,#7c3aed);
      border:2px solid rgba(192,132,252,0.8);transform:translate(-50%,-50%);
      pointer-events:none;
    `);
    base.appendChild(knob);
    this.container.appendChild(base);
    let touchId = null;
    const updatePos = (tx, ty) => {
      const r = base.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = (tx - cx) / (r.width / 2);
      let dy = (ty - cy) / (r.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        dx /= dist;
        dy /= dist;
      }
      this.dxVal = dx;
      this.dyVal = dy;
      knob.style.transform = `translate(calc(-50% + ${dx * 40}px),calc(-50% + ${dy * 40}px))`;
    };
    base.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      touchId = t.identifier;
      updatePos(t.clientX, t.clientY);
    }, { passive: false });
    base.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      updatePos(t.clientX, t.clientY);
    }, { passive: false });
    base.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (e.changedTouches[0].identifier === touchId) {
        touchId = null;
        this.dxVal = 0;
        this.dyVal = 0;
        knob.style.transform = "translate(-50%,-50%)";
      }
    }, { passive: false });
    return knob;
  }
  createButtons() {
    const btns = [
      { action: "attack", label: "\u2694", x: "right:20px", y: "bottom:20px", color: "#ef4444", size: "64px" },
      { action: "interact", label: "\u270B", x: "right:96px", y: "bottom:20px", color: "#3b82f6", size: "48px" },
      { action: "map", label: "\u{1F5FA}", x: "right:20px", y: "top:100px", color: "#a855f7", size: "44px" }
    ];
    for (let i = 0; i < 4; i++) {
      btns.push({
        action: `inventory${i + 1}`,
        label: `${i + 1}`,
        x: `left:${50 + i * 56}px`,
        y: "bottom:90px",
        color: "#8b5cf6",
        size: "40px"
      });
    }
    for (const b of btns) {
      const btn = this.el("div", `
        position:fixed;${b.x};${b.y};width:${b.size};height:${b.size};
        border-radius:50%;background:${b.color}44;border:2px solid ${b.color};
        display:flex;align-items:center;justify-content:center;
        font-size:${Math.round(parseInt(b.size) * 0.5)}px;color:#f8fafc;
        pointer-events:auto;touch-action:none;z-index:101;
        user-select:none;-webkit-user-select:none;
        transition:transform 0.08s,background 0.08s;
      `);
      btn.textContent = b.label;
      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        btn.style.transform = "scale(0.8)";
        btn.style.background = b.color + "99";
        this.pressed.add(b.action);
        this.justPressed.add(b.action);
      }, { passive: false });
      btn.addEventListener("touchend", (e) => {
        e.preventDefault();
        btn.style.transform = "scale(1)";
        btn.style.background = b.color + "44";
        this.pressed.delete(b.action);
      }, { passive: false });
      btn.addEventListener("touchcancel", () => {
        btn.style.transform = "scale(1)";
        btn.style.background = b.color + "44";
        this.pressed.delete(b.action);
      }, { passive: false });
      this.container.appendChild(btn);
    }
  }
  isTouchDevice() {
    return true;
  }
  dx() {
    return this.dxVal;
  }
  dy() {
    return this.dyVal;
  }
  cameraDx() {
    return this.cameraDeltaX;
  }
  cameraDy() {
    return this.cameraDeltaY;
  }
  isPressed(action) {
    return this.justPressed.has(action);
  }
  isDown(action) {
    return this.pressed.has(action);
  }
  update() {
    this.justPressed.clear();
    this.cameraDeltaX = 0;
    this.cameraDeltaY = 0;
  }
  destroy() {
    if (this.container.parentNode) this.container.parentNode.removeChild(this.container);
  }
};

// src/web/audio.ts
var AudioManager = class {
  ctx = null;
  masterGain = null;
  musicGain = null;
  musicNodes = [];
  musicPlaying = false;
  volume = 0.5;
  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.08;
    this.musicGain.connect(this.masterGain);
  }
  isReady() {
    return this.ctx !== null && this.ctx.state === "running";
  }
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }
  ensureResumed() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
  createNoiseBuffer(ctx, duration) {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }
  sfxNode(config, time) {
    const ctx = this.ctx;
    const t = time + (config.delay ?? 0);
    const dur = config.duration;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(config.gainStart ?? 0.3, t);
    gainNode.gain.exponentialRampToValueAtTime(config.gainEnd ?? 1e-3, t + dur);
    gainNode.connect(this.masterGain);
    let output = gainNode;
    if (config.filter) {
      const filter = ctx.createBiquadFilter();
      filter.type = config.filter.type;
      filter.frequency.value = config.filter.freq;
      if (config.filter.Q !== void 0) filter.Q.value = config.filter.Q;
      filter.connect(gainNode);
      output = filter;
    }
    if (config.noise) {
      const noiseDur = config.noiseDuration ?? dur;
      const buf = this.createNoiseBuffer(ctx, noiseDur);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(output);
      src.start(t);
      src.stop(t + dur);
    }
    if (config.type) {
      const osc = ctx.createOscillator();
      osc.type = config.type;
      osc.frequency.setValueAtTime(config.freqStart ?? 440, t);
      if (config.freqEnd !== void 0) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(config.freqEnd, 20),
          t + dur
        );
      }
      osc.connect(output);
      osc.start(t);
      osc.stop(t + dur);
    }
  }
  playSound(name) {
    this.ensureResumed();
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    switch (name) {
      case "attack":
        this.sfxNode(
          {
            type: "sine",
            freqStart: 800,
            freqEnd: 200,
            noise: true,
            noiseDuration: 0.05,
            duration: 0.1,
            gainStart: 0.35
          },
          now
        );
        break;
      case "hit":
        this.sfxNode(
          {
            type: "sine",
            freqStart: 300,
            freqEnd: 80,
            noise: true,
            noiseDuration: 0.04,
            duration: 0.08,
            gainStart: 0.4,
            filter: { type: "lowpass", freq: 1e3 }
          },
          now
        );
        break;
      case "enemyHit":
        this.sfxNode(
          {
            type: "sawtooth",
            freqStart: 600,
            freqEnd: 100,
            duration: 0.15,
            gainStart: 0.3,
            filter: { type: "lowpass", freq: 2e3 }
          },
          now
        );
        break;
      case "death":
        this.sfxNode(
          {
            type: "sine",
            freqStart: 400,
            freqEnd: 40,
            noise: true,
            noiseDuration: 0.2,
            duration: 0.3,
            gainStart: 0.4
          },
          now
        );
        break;
      case "pickup": {
        const t = now;
        this.sfxNode(
          {
            type: "sine",
            freqStart: 800,
            freqEnd: 1600,
            duration: 0.06,
            gainStart: 0.15
          },
          t
        );
        this.sfxNode(
          {
            type: "sine",
            freqStart: 1200,
            freqEnd: 2400,
            duration: 0.06,
            gainStart: 0.1,
            delay: 0.06
          },
          t
        );
        break;
      }
      case "levelup": {
        const t = now;
        const notes = [523, 659, 784];
        notes.forEach((f, i) => {
          this.sfxNode(
            {
              type: "sine",
              freqStart: f,
              freqEnd: f * 1.01,
              duration: 0.12,
              gainStart: 0.2,
              delay: i * 0.12
            },
            t
          );
        });
        break;
      }
      case "heal":
        this.sfxNode(
          {
            type: "sine",
            freqStart: 400,
            freqEnd: 1200,
            duration: 0.3,
            gainStart: 0.15
          },
          now
        );
        break;
      case "fireball":
        this.sfxNode(
          {
            type: "sawtooth",
            freqStart: 600,
            freqEnd: 120,
            noise: true,
            noiseDuration: 0.15,
            duration: 0.2,
            gainStart: 0.3
          },
          now
        );
        break;
      case "explosion":
        this.sfxNode(
          {
            noise: true,
            noiseDuration: 0.3,
            duration: 0.4,
            gainStart: 0.5,
            filter: { type: "lowpass", freq: 800, Q: 0.5 }
          },
          now
        );
        break;
      case "coin": {
        const t = now;
        this.sfxNode(
          {
            type: "square",
            freqStart: 2e3,
            freqEnd: 2e3,
            duration: 0.03,
            gainStart: 0.2
          },
          t
        );
        this.sfxNode(
          {
            type: "square",
            freqStart: 3e3,
            freqEnd: 3e3,
            duration: 0.03,
            gainStart: 0.15,
            delay: 0.05
          },
          t
        );
        break;
      }
      case "dialogue":
        this.sfxNode(
          {
            type: "sine",
            freqStart: 600,
            freqEnd: 600,
            duration: 0.02,
            gainStart: 0.06
          },
          now
        );
        break;
      case "gameover":
        this.sfxNode(
          {
            type: "sine",
            freqStart: 400,
            freqEnd: 40,
            duration: 1,
            gainStart: 0.3
          },
          now
        );
        break;
      case "victory": {
        const t = now;
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((f, i) => {
          this.sfxNode(
            {
              type: "sine",
              freqStart: f,
              freqEnd: f * 1.02,
              duration: 0.15,
              gainStart: 0.2,
              delay: i * 0.15
            },
            t
          );
        });
        break;
      }
      case "step":
        this.sfxNode(
          {
            noise: true,
            noiseDuration: 0.03,
            duration: 0.05,
            gainStart: 0.15,
            filter: { type: "lowpass", freq: 600 }
          },
          now
        );
        break;
      case "ambient":
        this.sfxNode(
          {
            noise: true,
            noiseDuration: 0.1,
            duration: 0.1,
            gainStart: 0.03,
            filter: { type: "lowpass", freq: 200 }
          },
          now
        );
        break;
    }
  }
  playMusic() {
    this.ensureResumed();
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    const ctx = this.ctx;
    if (!ctx) return;
    const mg = this.musicGain;
    const bass = ctx.createOscillator();
    bass.type = "sine";
    bass.frequency.value = 55;
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.04;
    bass.connect(bassGain);
    bassGain.connect(mg);
    bass.start();
    this.musicNodes.push(bass);
    const padLFO = ctx.createOscillator();
    padLFO.type = "sine";
    padLFO.frequency.value = 0.3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;
    padLFO.connect(lfoGain);
    padLFO.start();
    const pad = ctx.createOscillator();
    pad.type = "sine";
    pad.frequency.value = 220;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 400;
    padFilter.Q.value = 2;
    lfoGain.connect(padFilter.frequency);
    const padGain = ctx.createGain();
    padGain.gain.value = 0.03;
    pad.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(mg);
    pad.start();
    this.musicNodes.push(pad, padLFO);
    const pentatonic = [262, 294, 330, 392, 440, 524, 588, 660];
    const playMelody = () => {
      if (!this.musicPlaying) return;
      const now = ctx.currentTime;
      const noteIdx = Math.floor(Math.random() * pentatonic.length);
      const freq = pentatonic[noteIdx];
      const melOsc = ctx.createOscillator();
      melOsc.type = "sine";
      melOsc.frequency.value = freq;
      const melGain = ctx.createGain();
      melGain.gain.setValueAtTime(0, now);
      melGain.gain.linearRampToValueAtTime(0.02, now + 0.05);
      melGain.gain.linearRampToValueAtTime(0.02, now + 0.4);
      melGain.gain.linearRampToValueAtTime(0, now + 0.5);
      melOsc.connect(melGain);
      melGain.connect(mg);
      melOsc.start(now);
      melOsc.stop(now + 0.5);
      const h = setTimeout(playMelody, 4e3);
      this.musicNodes.push(melOsc);
      const origStop = melOsc.stop.bind(melOsc);
      melOsc.stop = ((t) => {
        clearTimeout(h);
        return origStop(t);
      });
    };
    playMelody();
  }
  stopMusic() {
    this.musicPlaying = false;
    for (const node of this.musicNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {
      }
    }
    this.musicNodes = [];
  }
};

// src/web/content.ts
var SKILLS = [
  { id: "strength", name: "Fuerza", description: "+2 da\xF1o f\xEDsico por nivel", maxLevel: 10, requirements: [], effects: [{ stat: "attackDamage", perLevel: 2 }], icon: "\u2694" },
  { id: "vitality", name: "Vitalidad", description: "+10 HP por nivel", maxLevel: 10, requirements: [], effects: [{ stat: "maxHp", perLevel: 10 }], icon: "\u2764" },
  { id: "magic", name: "Magia", description: "+5 mana y +2 da\xF1o m\xE1gico por nivel", maxLevel: 10, requirements: [{ skillId: "vitality", level: 3 }], effects: [{ stat: "maxMana", perLevel: 5 }, { stat: "magicDamage", perLevel: 2 }], icon: "\u2728" },
  { id: "defense", name: "Defensa", description: "-1 da\xF1o recibido por nivel", maxLevel: 10, requirements: [{ skillId: "vitality", level: 2 }], effects: [{ stat: "damageReduction", perLevel: 1 }], icon: "\u{1F6E1}" },
  { id: "swiftness", name: "Rapidez", description: "+5% velocidad por nivel", maxLevel: 5, requirements: [{ skillId: "strength", level: 5 }], effects: [{ stat: "speedMultiplier", perLevel: 0.05 }], icon: "\u{1F4A8}" }
];
var EQUIPMENT = [
  { id: "iron_sword", name: "Espada de Hierro", slot: "weapon", stats: { attackDamage: 5 }, description: "Espada b\xE1sica de hierro", tier: 1 },
  { id: "steel_sword", name: "Espada de Acero", slot: "weapon", stats: { attackDamage: 10 }, description: "Espada de acero templado", tier: 2 },
  { id: "magic_staff", name: "B\xE1culo M\xE1gico", slot: "weapon", stats: { magicDamage: 8, maxMana: 20 }, description: "B\xE1culo imbuido con poder arcano", tier: 2 },
  { id: "leather_armor", name: "Armadura de Cuero", slot: "armor", stats: { maxHp: 20, damageReduction: 1 }, description: "Armadura ligera de cuero", tier: 1 },
  { id: "chain_mail", name: "Cota de Malla", slot: "armor", stats: { maxHp: 40, damageReduction: 2 }, description: "Protecci\xF3n de anillos de acero", tier: 2 },
  { id: "plate_armor", name: "Armadura de Placas", slot: "armor", stats: { maxHp: 70, damageReduction: 3 }, description: "Armadura completa de placas", tier: 3 },
  { id: "iron_helm", name: "Yelmo de Hierro", slot: "helmet", stats: { maxHp: 10 }, description: "Protecci\xF3n b\xE1sica para la cabeza", tier: 1 },
  { id: "wizard_hat", name: "Sombrero de Mago", slot: "helmet", stats: { maxMana: 30, magicDamage: 3 }, description: "Sombrero c\xF3nico con poderes arcanos", tier: 2 },
  { id: "ring_of_power", name: "Anillo de Poder", slot: "accessory", stats: { attackDamage: 3, magicDamage: 3 }, description: "Anillo que potencia todas las habilidades", tier: 3 },
  { id: "amulet_of_life", name: "Amuleto de Vida", slot: "accessory", stats: { maxHp: 50, damageReduction: 1 }, description: "Amuleto que aumenta la vitalidad", tier: 2 }
];
var ENEMY_STATS = {
  ["Bandit" /* Bandit */]: { hp: 30, dmg: 8, speed: 30, xp: 25, name: "Bandit", color: "#ef4444" },
  ["Skeleton" /* Skeleton */]: { hp: 45, dmg: 12, speed: 25, xp: 40, name: "Skeleton", color: "#e2e8f0" },
  ["Mage" /* Mage */]: { hp: 35, dmg: 18, speed: 20, xp: 50, name: "Mage", color: "#3b82f6" },
  ["Goblin" /* Goblin */]: { hp: 25, dmg: 6, speed: 40, xp: 20, name: "Goblin", color: "#22c55e" },
  ["Boss" /* Boss */]: { hp: 120, dmg: 20, speed: 22, xp: 150, name: "Boss", color: "#7c3aed" }
};
var SPELL_DATA = {
  ["Fireball" /* Fireball */]: { cost: 20, dmg: 25, range: 100, cooldown: 800 },
  ["Heal" /* Heal */]: { cost: 15, heal: 30, range: 0, cooldown: 1e3 },
  ["Shield" /* Shield */]: { cost: 25, range: 0, cooldown: 5e3, duration: 3e3, dmgReduction: 0.5 }
};
var LOOT_TABLES = {
  ["Bandit" /* Bandit */]: {
    entries: [
      { chance: 0.4, goldMin: 5, goldMax: 15 },
      { chance: 0.3, item: "potion" },
      { chance: 0.2, item: "weapon" }
    ]
  },
  ["Skeleton" /* Skeleton */]: {
    entries: [
      { chance: 0.3, goldMin: 10, goldMax: 20 },
      { chance: 0.25, item: "bone sword" },
      { chance: 0.2, item: "potion" }
    ]
  },
  ["Mage" /* Mage */]: {
    entries: [
      { chance: 0.4, item: "mana potion" },
      { chance: 0.25, goldMin: 15, goldMax: 25 },
      { chance: 0.15, item: "scroll" }
    ]
  },
  ["Goblin" /* Goblin */]: {
    entries: [
      { chance: 0.5, goldMin: 3, goldMax: 10 },
      { chance: 0.2, item: "potion" },
      { chance: 0.1, item: "weapon" }
    ]
  },
  ["Boss" /* Boss */]: {
    entries: [
      { chance: 1, item: "rare weapon" },
      { chance: 1, goldMin: 50, goldMax: 100 },
      { chance: 0.5, item: "spell scroll" }
    ]
  }
};
var SHOPS = {
  merchant: [
    { name: "Health Potion", price: 25, description: "Restaura 30 HP" },
    { name: "Mana Potion", price: 20, description: "Restaura 20 mana" },
    { name: "Iron Sword", price: 80, description: "Espada de hierro b\xE1sica" }
  ],
  blacksmith: [
    { name: "Steel Sword", price: 150, description: "Espada de acero de alta calidad" },
    { name: "Shield", price: 100, description: "Escudo protector" },
    { name: "Fire Scroll", price: 200, description: "Pergamino de hechizo de fuego" }
  ]
};
var QUESTS = [
  {
    id: "Tutorial",
    title: "El Comienzo",
    description: "Habla con el Elder para comenzar tu aventura",
    objective: "Habla con el Elder",
    reward: { xp: 0, gold: 0, items: [] }
  },
  {
    id: "BanditSlayer",
    title: "Cazador de Bandidos",
    description: "Los bandidos est\xE1n aterrorizando el camino real",
    objective: "Mata 5 bandidos",
    reward: { xp: 100, gold: 30, items: [] }
  },
  {
    id: "SkeletonHunter",
    title: "Cazador de Esqueletos",
    description: "Esqueletos han emergido del antiguo cementerio",
    objective: "Mata 3 skeletons",
    reward: { xp: 200, gold: 50, items: [] }
  },
  {
    id: "BossFight",
    title: "El Jefe Final",
    description: "Un poderoso jefe amenaza el reino",
    objective: "Derrota al Boss",
    reward: { xp: 500, gold: 100, items: ["Legendary Sword"] }
  },
  {
    id: "Gatherer",
    title: "Acumulador",
    description: "Demuestra tu val\xEDa reuniendo riqueza",
    objective: "Consigue 100 de oro",
    reward: { xp: 150, gold: 0, items: ["Health Potion", "Health Potion", "Health Potion"] }
  }
];
function rollChance() {
  return Math.random() < 0.5;
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
var ContentManager = class {
  getEnemyStats(type) {
    const base = ENEMY_STATS[type];
    if (!base) {
      return { hp: 10, maxHp: 10, dmg: 1, speed: 10, xp: 0, name: "Unknown", color: "#ffffff" };
    }
    return { ...base, maxHp: base.hp };
  }
  getSpellData(type) {
    const data = SPELL_DATA[type];
    if (!data) {
      return { cost: 0, range: 0, cooldown: 0 };
    }
    return { ...data };
  }
  generateLoot(enemyType, x, y) {
    const table = LOOT_TABLES[enemyType];
    if (!table) return [];
    const drops = [];
    for (const entry of table.entries) {
      if (Math.random() > entry.chance) continue;
      if (entry.goldMin !== void 0 && entry.goldMax !== void 0) {
        const amount = randomInt(entry.goldMin, entry.goldMax);
        drops.push({
          type: "gold",
          x,
          y,
          data: { amount }
        });
      }
      if (entry.item) {
        const count = entry.count ?? 1;
        for (let i = 0; i < count; i++) {
          drops.push({
            type: "item",
            x: x + (rollChance() ? -1 : 1) * randomInt(0, 16),
            y: y + (rollChance() ? -1 : 1) * randomInt(0, 16),
            data: { name: entry.item }
          });
        }
      }
    }
    return drops;
  }
  getShopItems(shopType) {
    const items = SHOPS[shopType];
    if (!items) return [];
    return items.map((item) => ({ ...item }));
  }
  getAllQuests() {
    return QUESTS.map((q) => ({ ...q, reward: { ...q.reward, items: [...q.reward.items] } }));
  }
  getQuestReward(questId) {
    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return { xp: 0, gold: 0, items: [] };
    }
    return { ...quest.reward, items: [...quest.reward.items] };
  }
};

// src/web/input.ts
var Input = class {
  keys = /* @__PURE__ */ new Set();
  justPressed = /* @__PURE__ */ new Set();
  mouse = { x: 0, y: 0, left: false, right: false };
  mouseDeltaX = 0;
  mouseDeltaY = 0;
  pointerLocked = false;
  prevKeys = /* @__PURE__ */ new Set();
  handlers = [];
  constructor() {
    window.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
      this.keys.add(e.code);
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (this.pointerLocked) {
        this.mouseDeltaX += e.movementX;
        this.mouseDeltaY += e.movementY;
      }
    });
    window.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.mouse.left = true;
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.mouse.left = false;
    });
    window.addEventListener("blur", () => this.keys.clear());
    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement !== null;
    });
  }
  update() {
    this.justPressed.clear();
    for (const k of this.keys) {
      if (!this.prevKeys.has(k)) this.justPressed.add(k);
    }
    this.prevKeys = new Set(this.keys);
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
  }
  isDown(key) {
    return this.keys.has(key);
  }
  isPressed(key) {
    return this.justPressed.has(key);
  }
  requestPointerLock(canvas) {
    canvas.requestPointerLock();
  }
  dx() {
    return (this.isDown("KeyD") ? 1 : 0) - (this.isDown("KeyA") ? 1 : 0);
  }
  dy() {
    return (this.isDown("KeyS") ? 1 : 0) - (this.isDown("KeyW") ? 1 : 0);
  }
};

// src/web/gameplay.ts
var INVENTORY_SIZE = 10;
var HP_PER_LEVEL = 10;
var POTION_HEAL = 30;
var MANA_POTION_RESTORE = 20;
var DAMAGE_TEXT_SPEED = 1.5;
var DAMAGE_TEXT_LIFE = 1.5;
var QUEST_TRACKING = {
  BanditSlayer: { type: "kill", target: 5, enemyType: "Bandit" },
  SkeletonHunter: { type: "kill", target: 3, enemyType: "Skeleton" },
  BossFight: { type: "kill", target: 1, enemyType: "Boss" },
  Gatherer: { type: "gold", target: 100 },
  Tutorial: { type: "talk", target: 1 }
};
var LOOT_ITEM_MAP = {
  "potion": { itemType: "health_potion", value: 30 },
  "mana potion": { itemType: "mana_potion", value: 20 },
  "weapon": { itemType: "weapon", value: "iron_sword" },
  "bone sword": { itemType: "weapon", value: "bone_sword" },
  "scroll": { itemType: "scroll", value: "scroll" },
  "rare weapon": { itemType: "weapon", value: "rare_weapon" },
  "spell scroll": { itemType: "scroll", value: "spell_scroll" }
};
var CRAFT_RECIPES = [
  { resultId: "iron_sword", materials: [{ itemId: "weapon", quantity: 2 }] },
  { resultId: "leather_armor", materials: [{ itemId: "potion", quantity: 3 }] },
  { resultId: "magic_staff", materials: [{ itemId: "scroll", quantity: 2 }] },
  { resultId: "chain_mail", materials: [{ itemId: "weapon", quantity: 3 }, { itemId: "scroll", quantity: 1 }] },
  { resultId: "ring_of_power", materials: [{ itemId: "rare weapon", quantity: 2 }, { itemId: "spell scroll", quantity: 1 }] }
];
var GameplayManager = class {
  constructor(player, enemies, items, content) {
    this.player = player;
    this.enemies = enemies;
    this.items = items;
    this.content = content;
    this.player.attackDamage = this.player.attackDamage ?? 5;
    this.player.magicDamage = this.player.magicDamage ?? 2;
    this.player.damageReduction = this.player.damageReduction ?? 0;
    this.player.speedMultiplier = this.player.speedMultiplier ?? 1;
    this.player.skillPoints = this.player.skillPoints ?? 0;
    this.player.equipped = this.player.equipped ?? { weapon: null, armor: null, helmet: null, accessory: null };
    this.player.skills = this.player.skills ?? {};
    const quests = content.getAllQuests();
    this.questStates = quests.map((q) => ({
      quest: q,
      current: 0,
      completed: false
    }));
  }
  player;
  enemies;
  items;
  content;
  onLevelUp = null;
  level = 1;
  xp = 0;
  gold = 0;
  allQuestsComplete = false;
  damageTexts = [];
  inventory = new Array(INVENTORY_SIZE).fill(null);
  questStates = [];
  pendingProjectiles = [];
  dndSheet = null;
  lastDiceRoll = null;
  initDndCharacter(name, race, cls, attrs) {
    this.dndSheet = createCharacter(name, race, cls, attrs);
    this.player.hp = this.dndSheet.hitPoints;
    this.player.maxHp = this.dndSheet.maxHitPoints;
    this.player.attackDamage = this.dndSheet.modifiers.strength;
    this.player.magicDamage = this.dndSheet.modifiers.intelligence;
    this.player.level = this.dndSheet.level;
  }
  rollD20WithAdvantage() {
    const [r1, r2, best] = rollWithAdvantage();
    this.lastDiceRoll = { rolls: [r1, r2], total: best, sides: 20, type: "advantage" };
    return this.lastDiceRoll;
  }
  rollD20WithDisadvantage() {
    const [r1, r2, worst] = rollWithDisadvantage();
    this.lastDiceRoll = { rolls: [r1, r2], total: worst, sides: 20, type: "disadvantage" };
    return this.lastDiceRoll;
  }
  rollAttackDice() {
    const roll = rollD20();
    const dnd = this.dndSheet;
    const bonus = dnd ? getModifier(dnd.attributes[dnd.class.primaryAbility]) : 0;
    this.lastDiceRoll = { rolls: [roll], total: roll + bonus, sides: 20, type: "normal" };
    return this.lastDiceRoll;
  }
  rollDamageDice() {
    const dnd = this.dndSheet;
    if (!dnd) {
      const dmg = 8 + rollDie(12);
      this.lastDiceRoll = { rolls: [dmg - 8], total: dmg, sides: 12 };
      return this.lastDiceRoll;
    }
    const count = dnd.class.id === "rogue" ? 2 : 1;
    const hitDie = Math.min(dnd.hitDie, 12);
    const mod = getModifier(dnd.attributes[dnd.class.primaryAbility]);
    const rolls = rollDice(count, hitDie);
    const total = rolls.reduce((s, r) => s + r, 0) + mod;
    this.lastDiceRoll = { rolls, total, sides: hitDie };
    return this.lastDiceRoll;
  }
  getLastDiceRoll() {
    return this.lastDiceRoll;
  }
  learnSkill(skillId) {
    const skill = SKILLS.find((s) => s.id === skillId);
    if (!skill) return false;
    const currentLevel = this.player.skills[skillId] ?? 0;
    if (currentLevel >= skill.maxLevel) return false;
    for (const req of skill.requirements) {
      const reqLevel = this.player.skills[req.skillId] ?? 0;
      if (reqLevel < req.level) return false;
    }
    const sp = this.player.skillPoints;
    if (sp < 1) return false;
    this.player.skillPoints = sp - 1;
    this.player.skills[skillId] = currentLevel + 1;
    this.applySkillEffects(skill);
    return true;
  }
  getSkillLevel(skillId) {
    return this.player.skills[skillId] ?? 0;
  }
  getSkillPoints() {
    return this.player.skillPoints ?? 0;
  }
  getAvailableSkills() {
    return SKILLS.filter((s) => {
      const currentLevel = this.player.skills[s.id] ?? 0;
      if (currentLevel >= s.maxLevel) return false;
      for (const req of s.requirements) {
        const reqLevel = this.player.skills[req.skillId] ?? 0;
        if (reqLevel < req.level) return false;
      }
      return true;
    });
  }
  applySkillEffects(skill) {
    const level = this.player.skills[skill.id] ?? 0;
    for (const effect of skill.effects) {
      const key = effect.stat;
      const current = this.player[key] ?? 0;
      this.player[key] = effect.perLevel * level;
    }
  }
  equipItem(itemId) {
    const def = EQUIPMENT.find((e) => e.id === itemId);
    if (!def) return false;
    const invIndex = this.inventory.findIndex((s) => s && s.type === def.id);
    if (invIndex < 0) return false;
    const equipped = this.player.equipped;
    const oldItemId = equipped[def.slot];
    equipped[def.slot] = itemId;
    this.inventory[invIndex] = null;
    if (oldItemId) {
      const emptyIdx = this.inventory.findIndex((s) => !s);
      if (emptyIdx >= 0) {
        const oldDef = EQUIPMENT.find((e) => e.id === oldItemId);
        this.inventory[emptyIdx] = { type: oldItemId, name: oldDef?.name ?? oldItemId, quantity: 1 };
      }
    }
    return true;
  }
  unequipSlot(slot) {
    const equipped = this.player.equipped;
    const itemId = equipped[slot];
    if (!itemId) return false;
    const emptyIdx = this.inventory.findIndex((s) => !s);
    if (emptyIdx < 0) return false;
    const def = EQUIPMENT.find((e) => e.id === itemId);
    this.inventory[emptyIdx] = { type: itemId, name: def?.name ?? itemId, quantity: 1 };
    equipped[slot] = null;
    return true;
  }
  getEquippedStats() {
    const totals = {};
    const slots = ["weapon", "armor", "helmet", "accessory"];
    const equipped = this.player.equipped;
    for (const slot of slots) {
      const itemId = equipped[slot];
      if (!itemId) continue;
      const def = EQUIPMENT.find((e) => e.id === itemId);
      if (!def) continue;
      for (const [key, value] of Object.entries(def.stats)) {
        totals[key] = (totals[key] ?? 0) + value;
      }
    }
    return totals;
  }
  canCraft(itemId) {
    const recipe = CRAFT_RECIPES.find((r) => r.resultId === itemId);
    if (!recipe) return false;
    for (const mat of recipe.materials) {
      const count = this.inventory.reduce((sum, slot) => {
        if (slot && slot.type === mat.itemId) return sum + slot.quantity;
        return sum;
      }, 0);
      if (count < mat.quantity) return false;
    }
    return true;
  }
  craftItem(itemId) {
    if (!this.canCraft(itemId)) return false;
    const recipe = CRAFT_RECIPES.find((r) => r.resultId === itemId);
    for (const mat of recipe.materials) {
      let remaining = mat.quantity;
      for (let i = 0; i < this.inventory.length && remaining > 0; i++) {
        const slot = this.inventory[i];
        if (slot && slot.type === mat.itemId) {
          const taken = Math.min(slot.quantity, remaining);
          slot.quantity -= taken;
          remaining -= taken;
          if (slot.quantity <= 0) this.inventory[i] = null;
        }
      }
    }
    const def = EQUIPMENT.find((e) => e.id === itemId);
    this.addToInventory(itemId, def?.name ?? itemId, 1);
    return true;
  }
  calculateDamage(enemy) {
    if (this.dndSheet) {
      const roll = this.rollDamageDice();
      return roll.total;
    }
    const baseAtk = this.player.attackDamage ?? 5;
    const strBonus = (this.player.skills?.strength ?? 0) * 2;
    const equipStats = this.getEquippedStats();
    const equipAtk = equipStats.attackDamage ?? 0;
    const levelBonus = this.level;
    const totalAtk = baseAtk + strBonus + equipAtk + levelBonus + Math.floor(Math.random() * 5);
    let enemyDef = 0;
    if (enemy) {
      const enemyType = enemy.enemyType;
      if (enemyType) {
        const stats = this.content.getEnemyStats(enemyType);
        enemyDef = stats.damageReduction ?? 0;
      }
    }
    return Math.max(1, totalAtk - enemyDef);
  }
  update(dt, entities) {
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const d = this.damageTexts[i];
      d.y -= DAMAGE_TEXT_SPEED * dt * 60;
      const lifeProperty = d.life;
      if (lifeProperty !== void 0) {
        d.life = lifeProperty - dt;
        d.alpha = Math.max(0, lifeProperty / DAMAGE_TEXT_LIFE);
        if (lifeProperty <= 0) this.damageTexts.splice(i, 1);
      }
    }
  }
  addDamageText(text, x, y) {
    this.damageTexts.push({
      text,
      x,
      y,
      alpha: 1,
      vy: DAMAGE_TEXT_SPEED,
      life: DAMAGE_TEXT_LIFE
    });
  }
  onEnemyKilled(enemy) {
    const enemyType = enemy.enemyType || "Unknown";
    const stats = this.content.getEnemyStats(enemyType);
    this.addXp(stats.xp);
    this.addDamageText(`+${stats.xp} XP`, enemy.x, enemy.y - 40);
    const lootEntities = this.content.generateLoot(enemyType, enemy.x, enemy.y);
    for (const le of lootEntities) {
      const item = this.convertLootEntity(le);
      if (item) this.items.push(item);
    }
    if (Math.random() < 0.15) {
      const tier = Math.min(5, Math.ceil(this.level / 3) + 1);
      const pool = EQUIPMENT.filter((e) => e.tier <= tier);
      if (pool.length > 0) {
        const eq = pool[Math.floor(Math.random() * pool.length)];
        this.items.push({
          type: "item",
          name: eq.name,
          x: enemy.x + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 16),
          y: enemy.y + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 16),
          alive: true,
          itemType: "equipment",
          value: eq.id
        });
      }
    }
    for (const state of this.questStates) {
      if (state.completed) continue;
      const tracking = QUEST_TRACKING[state.quest.id];
      if (tracking && tracking.type === "kill" && tracking.enemyType === enemyType) {
        state.current = Math.min(state.current + 1, tracking.target);
        if (state.current >= tracking.target) {
          state.completed = true;
          this.addDamageText("Quest Complete!", this.player.x, this.player.y - 70);
          this.grantQuestReward(state.quest.id);
        }
      }
    }
    this.checkAllQuests();
  }
  onItemCollected(item) {
    if (item.itemType === "gold") {
      this.gold += item.value;
      this.addDamageText(`+${item.value} Gold`, this.player.x, this.player.y - 30);
      this.addToInventory("gold", "Gold", item.value);
    } else if (item.itemType === "equipment") {
      const def = EQUIPMENT.find((e) => e.id === item.value);
      this.addToInventory(item.value, def?.name ?? item.name, 1);
    } else if (item.itemType === "health_potion") {
      this.addToInventory("health_potion", "Health Potion", 1);
    } else if (item.itemType === "mana_potion") {
      this.addToInventory("mana_potion", "Mana Potion", 1);
    } else if (item.itemType === "weapon") {
      this.addToInventory(item.value, item.name, 1);
    } else {
      this.addToInventory(item.itemType || "item", item.name || "Item", 1);
    }
    for (const state of this.questStates) {
      if (state.completed) continue;
      const tracking = QUEST_TRACKING[state.quest.id];
      if (tracking && tracking.type === "gold") {
        state.current = Math.min(this.gold, tracking.target);
        if (state.current >= tracking.target) {
          state.completed = true;
          this.addDamageText("Quest Complete!", this.player.x, this.player.y - 70);
          this.grantQuestReward(state.quest.id);
        }
      }
    }
    this.checkAllQuests();
  }
  completeQuest(questId) {
    const state = this.questStates.find((qs) => qs.quest.id === questId);
    if (!state || state.completed) return;
    const tracking = QUEST_TRACKING[state.quest.id];
    const target = tracking ? tracking.target : 1;
    state.current = target;
    state.completed = true;
    this.addDamageText("Quest Complete!", this.player.x, this.player.y - 70);
    this.grantQuestReward(questId);
    this.checkAllQuests();
  }
  useInventorySlot(index) {
    const slot = this.inventory[index];
    if (!slot) return;
    if (slot.type === "health_potion" && slot.quantity > 0) {
      const maxHp = this.player.maxHp ?? 100;
      this.player.hp = Math.min((this.player.hp ?? 0) + POTION_HEAL, maxHp);
      this.addDamageText(`+${POTION_HEAL} HP`, this.player.x, this.player.y - 30);
      slot.quantity--;
      if (slot.quantity <= 0) this.inventory[index] = null;
    } else if (slot.type === "mana_potion" && slot.quantity > 0) {
      const maxMana = this.player.maxMana ?? 50;
      this.player.mana = Math.min((this.player.mana ?? 0) + MANA_POTION_RESTORE, maxMana);
      this.addDamageText(`+${MANA_POTION_RESTORE} Mana`, this.player.x, this.player.y - 30);
      slot.quantity--;
      if (slot.quantity <= 0) this.inventory[index] = null;
    }
  }
  castSpell(type, targetX, targetY) {
    const data = this.content.getSpellData(type);
    if (!data) return false;
    if ((this.player.mana ?? 0) < data.cost) return false;
    this.player.mana = Math.max(0, (this.player.mana ?? 0) - data.cost);
    if (type === "Fireball") {
      this.pendingProjectiles.push({
        type,
        x: this.player.x,
        y: this.player.y,
        targetX,
        targetY
      });
      this.addDamageText("\u{1F525} Fireball!", this.player.x, this.player.y - 40);
    } else if (type === "Heal") {
      const healAmt = data.heal ?? 30;
      this.player.hp = Math.min((this.player.hp ?? 0) + healAmt, this.player.maxHp ?? 100);
      this.addDamageText(`+${healAmt} HP`, this.player.x, this.player.y - 30);
    }
    return true;
  }
  getPendingProjectiles() {
    const result = [...this.pendingProjectiles];
    this.pendingProjectiles = [];
    return result;
  }
  getShopItems(shopType) {
    return this.content.getShopItems(shopType);
  }
  buyItem(shopType, index) {
    const items = this.content.getShopItems(shopType);
    if (index < 0 || index >= items.length) return false;
    const item = items[index];
    if (this.gold < item.price) return false;
    this.gold -= item.price;
    const invType = item.name.toLowerCase().replace(/\s+/g, "_");
    this.addToInventory(invType, item.name, 1);
    return true;
  }
  getDamageTexts() {
    return this.damageTexts.map((d) => ({
      text: d.text,
      x: d.x,
      y: d.y,
      alpha: d.alpha
    }));
  }
  getHUDData() {
    return {
      level: this.level,
      xp: this.xp,
      xpToNext: this.getXpToNext(),
      hp: this.player.hp ?? 0,
      maxHp: this.player.maxHp ?? 100,
      mana: this.player.mana ?? 0,
      maxMana: this.player.maxMana ?? 50,
      gold: this.gold,
      inventory: this.inventory,
      quests: this.questStates.map((qs) => ({
        name: qs.quest.title,
        objective: this.getQuestObjective(qs),
        completed: qs.completed
      })),
      allQuestsComplete: this.allQuestsComplete,
      dndSheet: this.dndSheet,
      lastDiceRoll: this.lastDiceRoll
    };
  }
  getDndAttackBonus() {
    if (!this.dndSheet) return 0;
    const mod = getModifier(this.dndSheet.attributes[this.dndSheet.class.primaryAbility]);
    return mod + this.dndSheet.proficiencyBonus;
  }
  getDndArmorClass() {
    if (!this.dndSheet) return 10;
    return this.dndSheet.armorClass;
  }
  addXp(amount) {
    this.xp += amount;
    this.checkLevelUp();
  }
  checkLevelUp() {
    const needed = this.getXpToNext();
    if (this.xp >= needed) {
      this.xp -= needed;
      this.level++;
      this.player.maxHp = (this.player.maxHp ?? 100) + HP_PER_LEVEL;
      this.player.hp = this.player.maxHp;
      this.player.mana = this.player.maxMana ?? 50;
      if (this.level % 2 === 0) {
        this.player.skillPoints = (this.player.skillPoints ?? 0) + 1;
      }
      this.addDamageText(`\xA1Level ${this.level}!`, this.player.x, this.player.y - 60);
      if (this.onLevelUp) this.onLevelUp();
      this.checkLevelUp();
    }
  }
  getXpToNext() {
    return Math.floor(100 * this.level * 1.5);
  }
  getQuestTarget(questId) {
    const tracking = QUEST_TRACKING[questId];
    return tracking ? tracking.target : 1;
  }
  getQuestObjective(state) {
    const tracking = QUEST_TRACKING[state.quest.id];
    if (!tracking) return state.quest.objective;
    let desc = state.quest.objective;
    if (desc.includes(String(tracking.target))) {
      const idx = desc.lastIndexOf("(");
      if (idx >= 0) desc = desc.substring(0, idx).trim();
    }
    return `${desc} (${state.current}/${tracking.target})${state.completed ? " \u2713" : ""}`;
  }
  grantQuestReward(questId) {
    const reward = this.content.getQuestReward(questId);
    if (reward.xp > 0) this.addXp(reward.xp);
    if (reward.gold > 0) this.gold += reward.gold;
    for (const itemName of reward.items) {
      this.addToInventory(itemName.toLowerCase().replace(/\s+/g, "_"), itemName, 1);
    }
  }
  checkAllQuests() {
    this.allQuestsComplete = this.questStates.every((qs) => qs.completed);
  }
  addToInventory(type, name, quantity) {
    for (let i = 0; i < this.inventory.length; i++) {
      const slot = this.inventory[i];
      if (slot && slot.type === type && type === "gold") {
        slot.quantity += quantity;
        return;
      }
    }
    for (let i = 0; i < this.inventory.length; i++) {
      if (!this.inventory[i]) {
        this.inventory[i] = { type, name, quantity };
        return;
      }
    }
  }
  convertLootEntity(entity) {
    if (entity.type === "gold") {
      const amount = entity.data.amount;
      return { type: "item", name: `${amount} Gold`, x: entity.x, y: entity.y, alive: true, itemType: "gold", value: amount };
    }
    const itemName = entity.data.name;
    const mapped = LOOT_ITEM_MAP[itemName] || { itemType: "item", value: itemName };
    return { type: "item", name: itemName, x: entity.x, y: entity.y, alive: true, itemType: mapped.itemType, value: mapped.value };
  }
};

// src/web/main.ts
var SPEED = 120;
var ATTACK_RANGE = 40;
var ATTACK_COOLDOWN = 500;
var INTERACT_RANGE = 50;
function main() {
  let gameState = "playing";
  let gameEntities = [];
  let items = [];
  let player;
  let renderer;
  let input;
  let touch;
  let audio;
  let content;
  let gameplay;
  let interactTarget = null;
  let dialogueShowing = false;
  let combatLog = [];
  let lastTime = 0;
  let stepTimer = 0;
  let showMinimap = false;
  let showShop = false;
  let shopType = "";
  let spells = [];
  const dialogues = [
    ["Hello traveler!", "Welcome to our village.", "Be careful of the bandits to the north!"],
    ["The forest is dangerous at night.", "I heard strange noises..."],
    ["Can you spare some gold?", "Just kidding, stay safe out there!"],
    ["I used to be an adventurer like you.", "Then I took an arrow to the knee."],
    ["The ancient ruins hold great treasures.", "But also great dangers..."]
  ];
  function initGame() {
    gameState = "playing";
    gameEntities = [];
    items = [];
    combatLog = [];
    dialogueShowing = false;
    interactTarget = null;
    spells = [];
    showMinimap = false;
    showShop = false;
    shopType = "";
    content = new ContentManager();
    player = { type: "player", name: "Hero", x: 4 * 32, y: 12 * 32, alive: true, hp: 100, maxHp: 100, mana: 50, maxMana: 50 };
    gameEntities.push(player);
    const enemies = [];
    const spawnNPC = (type, name, x, y, hp, enemyType) => {
      const e = { type, name, x, y, alive: true, dialogue: dialogues[Math.floor(Math.random() * dialogues.length)], enemyType };
      if (hp) {
        e.hp = hp;
        e.maxHp = hp;
      }
      gameEntities.push(e);
      return e;
    };
    spawnNPC("npc", "Merchant", 5 * 32, 8 * 32);
    spawnNPC("npc", "Guard", 6 * 32, 9 * 32);
    spawnNPC("npc", "Elder", 4 * 32, 7 * 32);
    spawnNPC("npc", "Blacksmith", 7 * 32, 8 * 32);
    spawnNPC("npc", "Farmer", 3 * 32, 10 * 32);
    for (let i = 0; i < 5; i++) {
      const stats = content.getEnemyStats("Bandit" /* Bandit */);
      const e = spawnNPC("enemy", `${"Bandit" /* Bandit */} lv${1 + Math.floor(Math.random() * 2)}`, 20 * 32 + Math.random() * 8 * 32, 5 * 32 + Math.random() * 6 * 32, stats.hp, "Bandit" /* Bandit */);
      e.targetX = e.x + (Math.random() - 0.5) * 4 * 32;
      e.targetY = e.y + (Math.random() - 0.5) * 4 * 32;
      enemies.push(e);
    }
    for (let i = 0; i < 3; i++) {
      const stats = content.getEnemyStats("Skeleton" /* Skeleton */);
      const e = spawnNPC("enemy", `${"Skeleton" /* Skeleton */} lv${1 + Math.floor(Math.random() * 2)}`, 26 * 32 + Math.random() * 6 * 32, 2 * 32 + Math.random() * 4 * 32, stats.hp, "Skeleton" /* Skeleton */);
      e.targetX = e.x + (Math.random() - 0.5) * 3 * 32;
      e.targetY = e.y + (Math.random() - 0.5) * 3 * 32;
      enemies.push(e);
    }
    for (let i = 0; i < 2; i++) {
      const stats = content.getEnemyStats("Mage" /* Mage */);
      const e = spawnNPC("enemy", `${"Mage" /* Mage */} lv1`, 28 * 32 + Math.random() * 4 * 32, 8 * 32 + Math.random() * 4 * 32, stats.hp, "Mage" /* Mage */);
      e.targetX = e.x + (Math.random() - 0.5) * 2 * 32;
      e.targetY = e.y + (Math.random() - 0.5) * 2 * 32;
      enemies.push(e);
    }
    const bossStats = content.getEnemyStats("Boss" /* Boss */);
    const boss = spawnNPC("enemy", `${"Boss" /* Boss */}`, 30 * 32, 6 * 32, bossStats.hp, "Boss" /* Boss */);
    boss.targetX = boss.x;
    boss.targetY = boss.y;
    enemies.push(boss);
    gameplay = new GameplayManager(player, enemies, items, content);
    if (charName && charRace && charClass && charAttrs) {
      gameplay.initDndCharacter(charName, charRace, charClass, charAttrs);
    }
    gameplay.onLevelUp = () => {
      audio.playSound("levelup");
      renderer.showLevelUp(player.y - 60);
    };
    renderer.hud = gameplay.getHUDData();
    renderer.gameOver = false;
    renderer.showVictory = false;
  }
  const canvas = document.getElementById("game-canvas");
  renderer = new Renderer(canvas);
  input = new Input();
  touch = new TouchController(canvas);
  canvas.addEventListener("click", () => {
    if (!input.pointerLocked) input.requestPointerLock(canvas);
  });
  audio = new AudioManager();
  let charName = "";
  let charRace = null;
  let charClass = null;
  let charAttrs = null;
  function startCharCreation() {
    const attrValues = [15, 14, 13, 12, 10, 8];
    renderer.setCharCreationState({
      phase: "race",
      raceIndex: 0,
      classIndex: 0,
      attrs: [],
      attrIndex: 0,
      name: "Hero"
    });
    gameState = "charcreation";
  }
  function handleCharCreationInput() {
    const state = renderer.charCreationState;
    if (!state) return;
    const prevPressed = window.__prevKeys || {};
    const keys = {};
    for (const k of ["ArrowUp", "ArrowDown", "Space", "KeyB", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6"]) {
      keys[k] = input.isPressed(k);
    }
    ;
    window.__prevKeys = keys;
    if (state.phase === "race") {
      if (input.isPressed("ArrowDown") || keys.ArrowDown) state.raceIndex = Math.min(RACES.length - 1, state.raceIndex + 1);
      if (input.isPressed("ArrowUp") || keys.ArrowUp) state.raceIndex = Math.max(0, state.raceIndex - 1);
      if (input.isPressed("Space") || keys.Space) {
        charRace = RACES[state.raceIndex];
        state.phase = "class";
        state.classIndex = 0;
      }
    } else if (state.phase === "class") {
      if (input.isPressed("ArrowDown") || keys.ArrowDown) state.classIndex = Math.min(CLASSES.length - 1, state.classIndex + 1);
      if (input.isPressed("ArrowUp") || keys.ArrowUp) state.classIndex = Math.max(0, state.classIndex - 1);
      if (input.isPressed("Space") || keys.Space) {
        charClass = CLASSES[state.classIndex];
        state.phase = "attributes";
        state.attrs = [];
        state.attrIndex = 0;
      }
      if (input.isPressed("KeyB") || keys.KeyB) {
        state.phase = "race";
        charRace = null;
      }
    } else if (state.phase === "attributes") {
      if (state.attrs.length < 6) {
        const remaining = [15, 14, 13, 12, 10, 8];
        for (const a of state.attrs) {
          const idx = remaining.indexOf(a);
          if (idx >= 0) remaining.splice(idx, 1);
        }
        const numKey = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6"];
        for (let i = 0; i < remaining.length; i++) {
          if (input.isPressed(numKey[i])) {
            state.attrs.push(remaining[i]);
            if (state.attrs.length < 6) {
              const idx = remaining.indexOf(remaining[i]);
              if (idx >= 0) remaining.splice(idx, 1);
            }
            break;
          }
        }
      } else {
        if (input.isPressed("Space")) {
          charAttrs = {
            strength: state.attrs[0],
            dexterity: state.attrs[1],
            constitution: state.attrs[2],
            intelligence: state.attrs[3],
            wisdom: state.attrs[4],
            charisma: state.attrs[5]
          };
          state.phase = "confirm";
        }
      }
      if (input.isPressed("KeyB") || keys.KeyB) {
        if (state.attrs.length > 0) {
          state.attrs.pop();
        } else {
          state.phase = "class";
          charClass = null;
        }
      }
    } else if (state.phase === "confirm") {
      if (input.isPressed("Space")) {
        renderer.setCharCreationState(null);
        audio.playMusic();
        initGame();
        return;
      }
      if (input.isPressed("KeyB") || keys.KeyB) {
        state.phase = "attributes";
        state.attrs = [];
        charAttrs = null;
      }
    }
  }
  startCharCreation();
  const loadingEl = document.querySelector(".loading");
  if (loadingEl) loadingEl.remove();
  function triggerCameraShake() {
  }
  function findNearestEnemy() {
    let closest = null;
    let closestDist = ATTACK_RANGE * 3;
    for (const e of gameEntities) {
      if (e === player || !e.alive || e.type !== "enemy") continue;
      const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
      if (d < closestDist) {
        closestDist = d;
        closest = e;
      }
    }
    return closest;
  }
  function triggerCombat(attacker, target) {
    let dmg;
    const stats = target.enemyType ? content.getEnemyStats(target.enemyType) : null;
    const baseDmg = stats ? stats.dmg : 10;
    if (attacker === player) {
      dmg = gameplay.calculateDamage(target);
      if (target.shieldEnd && performance.now() < target.shieldEnd) dmg = Math.floor(dmg * 0.5);
      target.hp -= dmg;
      const diceMsg = gameplay.dndSheet ? ` \u{1F3B2}${gameplay.getLastDiceRoll()?.rolls.join("+")}=${gameplay.getLastDiceRoll()?.total}` : "";
      const msg = `\u2694\uFE0F ${attacker.name} hits ${target.name} for ${dmg}!${diceMsg}`;
      combatLog.push(msg);
      if (combatLog.length > 6) combatLog.shift();
      audio.playSound("attack");
    } else {
      dmg = baseDmg + Math.floor(Math.random() * 5);
      if (player.shieldEnd && performance.now() < player.shieldEnd) dmg = Math.floor(dmg * 0.5);
      player.hp -= dmg;
      const msg = `\u{1F4A2} ${attacker.name} hits you for ${dmg}!`;
      combatLog.push(msg);
      if (combatLog.length > 6) combatLog.shift();
      audio.playSound("hit");
      audio.playSound("enemyHit");
    }
    attacker.lastAttack = performance.now();
    gameplay.addDamageText(`-${dmg}`, target.x, target.y - 20);
    renderer.addParticles(target.x, target.y - 10, "#ef4444", 5);
    renderer.flashScreen();
    triggerCameraShake();
    if (target.hp <= 0) {
      target.alive = false;
      target.hp = 0;
      const msg2 = `\u{1F480} ${target.name} defeated!`;
      combatLog.push(msg2);
      if (combatLog.length > 6) combatLog.shift();
      renderer.addParticles(target.x, target.y, "#fbbf24", 12);
      audio.playSound("death");
      if (target === player) {
        gameState = "gameover";
        renderer.gameOver = true;
        audio.playSound("gameover");
        audio.stopMusic();
      } else {
        gameplay.onEnemyKilled(target);
        if (gameplay.getHUDData().allQuestsComplete) {
          gameState = "victory";
          renderer.showVictory = true;
          audio.playSound("victory");
        }
      }
    }
  }
  const gameLoop = (time) => {
    const dt = lastTime ? Math.min((time - lastTime) / 1e3, 0.05) : 0.016;
    lastTime = time;
    if (input.pointerLocked) {
      renderer.yaw += input.mouseDeltaX * 2e-3;
      renderer.pitch -= input.mouseDeltaY * 2e-3;
      renderer.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, renderer.pitch));
    }
    renderer.yaw += touch.cameraDx() * 0.01;
    renderer.pitch -= touch.cameraDy() * 0.01;
    renderer.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, renderer.pitch));
    input.update();
    if (gameState === "charcreation") {
      handleCharCreationInput();
      renderer.render(time, dt);
      requestAnimationFrame(gameLoop);
      return;
    }
    if (input.isPressed("KeyR") && (gameState === "gameover" || gameState === "victory")) {
      initGame();
      audio.playMusic();
    }
    if (gameState === "playing") {
      const yaw = renderer.yaw;
      const forwardX = Math.sin(yaw), forwardZ = Math.cos(yaw);
      const rightX = Math.cos(yaw), rightZ = -Math.sin(yaw);
      let moveX = 0, moveZ = 0;
      if (input.isDown("KeyW")) {
        moveX += forwardX;
        moveZ += forwardZ;
      }
      if (input.isDown("KeyS")) {
        moveX -= forwardX;
        moveZ -= forwardZ;
      }
      if (input.isDown("KeyA")) {
        moveX -= rightX;
        moveZ -= rightZ;
      }
      if (input.isDown("KeyD")) {
        moveX += rightX;
        moveZ += rightZ;
      }
      const touchDx = touch.dx(), touchDy = touch.dy();
      if (touchDx !== 0 || touchDy !== 0) {
        moveX += -touchDy * forwardX + touchDx * rightX;
        moveZ += -touchDy * forwardZ + touchDx * rightZ;
      }
      if (moveX !== 0 || moveZ !== 0) {
        const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX /= len;
        moveZ /= len;
        const newX = player.x + moveX * SPEED * dt;
        const newY = player.y + moveZ * SPEED * dt;
        const tileX = Math.floor(newX / TILE);
        const tileY = Math.floor(newY / TILE);
        if (TILEMAP[tileY]?.[tileX] !== void 0 && TILEMAP[tileY][tileX] !== 2) {
          player.x = newX;
          player.y = newY;
          stepTimer += dt;
          if (stepTimer > 0.3) {
            stepTimer = 0;
            audio.playSound("step");
          }
        }
      }
      const attackPressed = input.isPressed("Space") || input.pointerLocked && input.mouse.left || touch.isPressed("attack");
      if (attackPressed) {
        const now2 = performance.now();
        if (!player.lastAttack || now2 - player.lastAttack > ATTACK_COOLDOWN) {
          player.lastAttack = now2;
          let target = null;
          const centerTarget = renderer.getCenterTarget();
          if (centerTarget && centerTarget.type === "enemy") {
            target = gameEntities.find(
              (ge) => ge.type === "enemy" && ge.alive && ge.name === centerTarget.name && Math.abs(ge.x - centerTarget.x) < 4 && Math.abs(ge.y - centerTarget.y) < 4
            ) || null;
          }
          if (!target) {
            let closestDist = ATTACK_RANGE;
            for (const e of gameEntities) {
              if (e === player || !e.alive || e.type !== "enemy") continue;
              const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
              if (d < closestDist) {
                closestDist = d;
                target = e;
              }
            }
          }
          if (target) {
            triggerCombat(player, target);
            renderer.addParticles(target.x, target.y - 10, "#fbbf24", 6);
          }
        }
      }
      const interactPressed = input.isPressed("KeyE") || touch.isPressed("interact");
      if (interactPressed) {
        let closest = null;
        let closestDist = INTERACT_RANGE;
        let closestItem = null;
        for (const e of gameEntities) {
          if (e === player || !e.alive) continue;
          if (e.type === "npc") {
            const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
            if (d < closestDist) {
              closestDist = d;
              closest = e;
            }
          }
        }
        for (const item of items) {
          if (!item.alive) continue;
          const d = Math.sqrt((item.x - player.x) ** 2 + (item.y - player.y) ** 2);
          if (d < INTERACT_RANGE + 10) {
            closestItem = item;
          }
        }
        if (closestItem) {
          closestItem.alive = false;
          gameplay.onItemCollected(closestItem);
          renderer.addParticles(closestItem.x, closestItem.y, "#34d399", 5);
          audio.playSound("pickup");
        } else if (closest) {
          if (closest.name === "Merchant" || closest.name === "Blacksmith") {
            showShop = true;
            shopType = closest.name === "Merchant" ? "merchant" : "blacksmith";
            dialogueShowing = false;
          } else {
            showShop = false;
            shopType = "";
            if (!dialogueShowing || interactTarget !== closest) {
              interactTarget = closest;
              closest.dialogueIdx = 0;
              dialogueShowing = true;
              audio.playSound("dialogue");
            } else {
              closest.dialogueIdx = (closest.dialogueIdx ?? 0) + 1;
              if (closest.dialogueIdx >= (closest.dialogue?.length ?? 0)) dialogueShowing = false;
            }
          }
        }
      }
      if (showShop) {
        if (input.isPressed("Digit1")) {
          if (gameplay.buyItem(shopType, 0)) audio.playSound("coin");
        }
        if (input.isPressed("Digit2")) {
          if (gameplay.buyItem(shopType, 1)) audio.playSound("coin");
        }
        if (input.isPressed("Digit3")) {
          if (gameplay.buyItem(shopType, 2)) audio.playSound("coin");
        }
      }
      if (input.isPressed("Escape")) dialogueShowing = false;
      if (input.isPressed("Escape") || touch.isPressed("map")) {
        dialogueShowing = false;
        showShop = false;
        shopType = "";
      }
      if (input.isPressed("KeyM") || touch.isPressed("map")) showMinimap = !showMinimap;
      renderer.toggleMinimap(showMinimap);
      if (input.isPressed("KeyQ")) {
        const nearest = findNearestEnemy();
        if (nearest) {
          const ok = gameplay.castSpell("Fireball", nearest.x, nearest.y);
          if (ok) {
            audio.playSound("fireball");
            const projs = gameplay.getPendingProjectiles();
            for (const p of projs) spells.push({ ...p, time: performance.now() });
          }
        }
      }
      if (input.isPressed("KeyF")) {
        const ok = gameplay.castSpell("Heal", 0, 0);
        if (ok) audio.playSound("heal");
      }
      for (let i = 0; i < 4; i++) {
        if (input.isPressed(`Digit${i + 1}`) || input.isPressed(`Numpad${i + 1}`) || touch.isPressed(`inventory${i + 1}`)) {
          gameplay.useInventorySlot(i);
          audio.playSound("heal");
        }
      }
      const now = performance.now();
      for (const e of gameEntities) {
        if (e === player || !e.alive || e.type !== "npc" && e.type !== "enemy") continue;
        if (e.targetX === void 0) {
          e.targetX = e.x + (Math.random() - 0.5) * 100;
          e.targetY = e.y + (Math.random() - 0.5) * 100;
        }
        const ddx = e.targetX - e.x, ddy = e.targetY - e.y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        const speed = e.enemyType ? content.getEnemyStats(e.enemyType).speed : 30;
        if (dist > 5) {
          e.x += ddx / dist * speed * dt;
          e.y += ddy / dist * speed * dt;
        } else {
          e.targetX = e.x + (Math.random() - 0.5) * 150;
          e.targetY = e.y + (Math.random() - 0.5) * 150;
        }
        if (e.type === "enemy" && (!e.lastAttack || now - e.lastAttack > 1500)) {
          const d = Math.sqrt((player.x - e.x) ** 2 + (player.y - e.y) ** 2);
          if (d < ATTACK_RANGE) triggerCombat(e, player);
        }
      }
      for (let i = spells.length - 1; i >= 0; i--) {
        const s = spells[i];
        if (now - s.time > 500) {
          spells.splice(i, 1);
          continue;
        }
        const p = (now - s.time) / 500;
        s.x += (s.targetX - s.x) * 0.1;
        s.y += (s.targetY - s.y) * 0.1;
      }
      gameplay.update(dt, gameEntities);
    }
    renderer.setCamera({ x: player.x, y: player.y });
    const aliveEntities = gameEntities.filter((e) => e.alive || e === player);
    const renderEntities = aliveEntities.map((e) => ({
      type: e.type,
      name: e.name || e.enemyType || "",
      x: e.x,
      y: e.y,
      hp: e.hp,
      maxHp: e.maxHp
    }));
    renderEntities.push(...items.filter((i) => i.alive).map((i) => ({
      type: "item",
      name: i.name || "",
      x: i.x,
      y: i.y,
      itemType: i.itemType
    })));
    renderer.setEntities(renderEntities);
    renderer.hud = gameplay.getHUDData();
    const hud = renderer.hud;
    if (showShop && shopType) {
      hud.shopItems = gameplay.getShopItems(shopType);
      hud.showShop = true;
    }
    if (hud && hud.allQuestsComplete && gameState === "playing") {
      gameState = "victory";
      renderer.showVictory = true;
      audio.playSound("victory");
    }
    renderer.damageTexts = gameplay.getDamageTexts();
    renderer.render(time, dt);
    if (touch.isTouchDevice()) touch.update();
    if (dialogueShowing && interactTarget && interactTarget.alive) {
      const ctx = canvas.getContext("2d");
      const dw = 400, dh = 100, dx = canvas.width / 2 - dw / 2, dy = canvas.height - dh - 40;
      ctx.fillStyle = "rgba(15,23,42,0.92)";
      ctx.beginPath();
      ctx.roundRect(dx, dy, dw, dh, 10);
      ctx.fill();
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(dx, dy, dw, dh, 10);
      ctx.stroke();
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`\u{1F5E3}\uFE0F ${interactTarget.name}`, dx + 16, dy + 24);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(interactTarget.dialogue[interactTarget.dialogueIdx ?? 0], canvas.width / 2, dy + 56);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.fillText("[E] continue  [ESC] close", canvas.width / 2, dy + 80);
    }
    if (combatLog.length > 0) {
      const ctx = canvas.getContext("2d");
      const lw = 300, lh = Math.min(combatLog.length * 18 + 10, 120);
      const lx = canvas.width / 2 - lw / 2, ly = 16;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.beginPath();
      ctx.roundRect(lx, ly, lw, lh, 6);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      let lyOff = ly + 16;
      for (const msg of combatLog.slice(-5)) {
        ctx.fillText(msg, canvas.width / 2, lyOff);
        lyOff += 18;
      }
    }
    requestAnimationFrame(gameLoop);
  };
  requestAnimationFrame(gameLoop);
}
window.addEventListener("DOMContentLoaded", main);
