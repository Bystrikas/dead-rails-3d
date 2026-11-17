import * as THREE from "three";
import "./style.css";

type Enemy = { group: THREE.Group; hp: number; speed: number; attack: number; hitTimer: number };
type Loot = { mesh: THREE.Mesh; taken: boolean };

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9a6a48);
scene.fog = new THREE.FogExp2(0x9a6a48, 0.012);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 220);
camera.position.set(0, 2.2, 7);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.querySelector("#app")!.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffd8ad, 0x493025, 1.8));
const sun = new THREE.DirectionalLight(0xffd0a0, 2.3);
sun.position.set(-18, 30, 12); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -35; sun.shadow.camera.right = 35; sun.shadow.camera.top = 35; sun.shadow.camera.bottom = -35;
scene.add(sun);

const mat = (color: number, roughness = 0.9, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const groundMat = mat(0x98704b);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), groundMat);
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.08; ground.receiveShadow = true; scene.add(ground);

const train = new THREE.Group(); scene.add(train);
const black = mat(0x17191a, .55, .5), iron = mat(0x554d43, .5, .65), wood = mat(0x704329), darkWood = mat(0x3d281c), brass = mat(0xb57b35,.35,.65);
function box(parent: THREE.Object3D, w:number,h:number,d:number, material:THREE.Material, x:number,y:number,z:number) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
box(train, 3.3, .7, 5.4, black, 0, 1.05, -1.1);
box(train, 2.35, 2.3, 2.3, black, 0, 2.35, -2.1);
box(train, 2.1, .35, 1.8, iron, 0, 3.65, -2.1);
const boiler = new THREE.Mesh(new THREE.CylinderGeometry(.88,.88,2.6,16),black);
boiler.rotation.x=Math.PI/2; boiler.position.set(0,2.35,-3.4); boiler.castShadow=true; train.add(boiler);
const chimney = new THREE.Mesh(new THREE.CylinderGeometry(.24,.34,1.15,12),iron); chimney.position.set(0,3.65,-4.25); chimney.castShadow=true; train.add(chimney);
box(train, 3.5,.22,1.2,iron,0,.55,-4.15);
box(train, 2.8,1.8,3.8,wood,0,1.5,2.25);
box(train, 2.9,.18,4, darkWood,0,2.48,2.25);
for (const x of [-1.25,1.25]) for (const z of [-2.4,-.2,2.7,4.1]) {
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.22,16),black);
  wheel.rotation.z=Math.PI/2; wheel.position.set(x,.62,z); wheel.castShadow=true; train.add(wheel);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.24,12),brass); hub.rotation.z=Math.PI/2; hub.position.copy(wheel.position); train.add(hub);
}
for(let i=0;i<8;i++) box(train,2.7,.12,.12,darkWood,0,.8,-4.5+i*.7);

const railMat = mat(0x383b3b,.4,.8), sleeperMat = mat(0x4c3021);
for(let z=-125;z<55;z+=2.2) box(scene,3.5,.16,.65,sleeperMat,0,.02,z);
for(const x of [-1.35,1.35]) box(scene,.16,.25,190,railMat,x,.2,-35);

const rockMat = mat(0x76513a), mesaMat = mat(0x754a35), cactusMat=mat(0x36513a);
for(let i=0;i<38;i++) {
  const side = i%2===0 ? -1:1, z=-115+Math.random()*155, x=side*(8+Math.random()*28);
  const h=3+Math.random()*11, w=5+Math.random()*12;
  const mesa=new THREE.Mesh(new THREE.CylinderGeometry(w*.75,w,h,5),mesaMat);
  mesa.position.set(x,h/2-0.1,z); mesa.rotation.y=Math.random()*2; mesa.castShadow=true; scene.add(mesa);
}
for(let i=0;i<35;i++) {
  const side=i%2===0?-1:1, x=side*(5+Math.random()*24), z=-105+Math.random()*145;
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.5+Math.random()*1.7,0),rockMat);
  rock.position.set(x,.5,z); rock.scale.y=.5+Math.random(); rock.castShadow=true; scene.add(rock);
  if(i%3===0) {
    const cactus=new THREE.Group(); cactus.position.set(x+side*1.5,0,z-2);
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,2.2,7),cactusMat); stem.position.y=1.1; cactus.add(stem);
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,1,7),cactusMat); arm.position.set(.35,1.2,0); arm.rotation.z=-.8; cactus.add(arm);
    scene.add(cactus);
  }
}
const sunBall=new THREE.Mesh(new THREE.SphereGeometry(4,24,24),new THREE.MeshBasicMaterial({color:0xffc078}));
sunBall.position.set(-38,27,-115); scene.add(sunBall);

const weapon = new THREE.Group(); camera.add(weapon); weapon.position.set(.42,-.38,-.72);
const gunMat=mat(0x292b2c,.35,.7), gripMat=mat(0x51301d);
box(weapon,.16,.17,.7,gunMat,0,0,-.1); box(weapon,.13,.28,.2,gripMat,0,-.18,.08);
const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.45,10),gunMat); barrel.rotation.x=Math.PI/2; barrel.position.set(0,.03,-.55); weapon.add(barrel);
scene.add(camera);

const keys: Record<string,boolean>={};
let locked=false, playing=false, health=100, ammo=12, reserve=48, scrap=0, wave=1, kills=0;
let fireCooldown=0, reloadTimer=0, spawnTimer=2, damageFlash=0, recoil=0;
const enemies:Enemy[]=[]; const loots:Loot[]=[];
const raycaster=new THREE.Raycaster();
const clock=new THREE.Clock();
const ui = {
  overlay: document.querySelector<HTMLElement>("#overlay")!,
  start: document.querySelector<HTMLButtonElement>("#start")!,
  health: document.querySelector<HTMLElement>("#health")!,
  ammo: document.querySelector<HTMLElement>("#ammo")!,
  wave: document.querySelector<HTMLElement>("#wave")!,
  scrap: document.querySelector<HTMLElement>("#scrap")!,
  toast: document.querySelector<HTMLElement>("#toast")!,
  damage: document.querySelector<HTMLElement>("#damage")!,
  objective: document.querySelector<HTMLElement>("#objective")!
};
let toastTimer=0;
function toast(message:string) { ui.toast.textContent=message; ui.toast.style.opacity="1"; toastTimer=1.5; }
function updateHud() {
  ui.health.textContent=String(Math.max(0,Math.ceil(health)));
  ui.ammo.textContent=`${ammo} / ${reserve}`; ui.wave.textContent=String(wave); ui.scrap.textContent=String(scrap);
  ui.objective.textContent=`ONDATA ${wave} • ELIMINAZIONI ${kills}`;
}
function makeZombie(x:number,z:number):Enemy {
  const group=new THREE.Group(); group.position.set(x,0,z);
  const skin=mat(0x78806a), clothes=mat(0x493d32), eyes=new THREE.MeshBasicMaterial({color:0xff3b18});
  const torso=new THREE.Mesh(new THREE.BoxGeometry(.72,1,.38),clothes); torso.position.y=1.15; torso.castShadow=true; group.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.31,10,8),skin); head.position.y=1.9; head.castShadow=true; group.add(head);
  const eye1=new THREE.Mesh(new THREE.SphereGeometry(.045,6,6),eyes); eye1.position.set(-.11,1.94,-.27); group.add(eye1);
  const eye2=eye1.clone(); eye2.position.x=.11; group.add(eye2);
  for(const sx of [-.48,.48]) {
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.2,.8,.22),skin); arm.position.set(sx,1.15,-.03); arm.rotation.z=sx*.55; arm.castShadow=true; group.add(arm);
  }
  for(const sx of [-.2,.2]) { const leg=new THREE.Mesh(new THREE.BoxGeometry(.24,.72,.27),darkWood); leg.position.set(sx,.38,0); leg.castShadow=true; group.add(leg); }
  scene.add(group);
  return {group,hp:2,speed:1.15+Math.random()*.55,attack:0,hitTimer:0};
}
function spawnWave() {
  const count=3+wave*2;
  for(let i=0;i<count;i++) {
    const side=Math.random()<.5?-1:1;
    enemies.push(makeZombie(side*(3.7+Math.random()*5),-24-Math.random()*42));
  }
  toast(`ONDATA ${wave} IN ARRIVO`);
}
function dropLoot(pos:THREE.Vector3) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(.48,.42,.48),mat(0xb47a38,.5,.25));
  mesh.position.copy(pos); mesh.position.y=.4; mesh.castShadow=true; scene.add(mesh); loots.push({mesh,taken:false});
}
function shoot() {
  if(!playing||!locked||fireCooldown>0||reloadTimer>0)return;
  if(ammo<=0){toast("PREMI R PER RICARICARE");fireCooldown=.25;return;}
  ammo--; fireCooldown=.28; recoil=.12;
  raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
  const targets=enemies.flatMap(e=>e.group.children);
  const hit=raycaster.intersectObjects(targets,false)[0];
  if(hit) {
    const enemy=enemies.find(e=>e.group===hit.object.parent || e.group.children.includes(hit.object));
    if(enemy) {
      enemy.hp--; enemy.hitTimer=.12;
      if(enemy.hp<=0) {
        const p=enemy.group.position.clone(); scene.remove(enemy.group);
        enemies.splice(enemies.indexOf(enemy),1); kills++; dropLoot(p); toast("BERSAGLIO ELIMINATO");
      }
    }
  }
  updateHud();
}
function reload() {
  if(!playing||reloadTimer>0||ammo===12||reserve<=0)return;
  reloadTimer=1.25; toast("RICARICA...");
}
function damagePlayer(amount:number) {
  health-=amount; damageFlash=.35; ui.damage.style.opacity=".8"; updateHud();
  if(health<=0) {
    health=0; playing=false; document.exitPointerLock?.();
    ui.overlay.style.display="grid";
    ui.overlay.querySelector("h1")!.innerHTML="GAME<br><em>OVER</em>";
    ui.overlay.querySelector(".intro")!.innerHTML=`Sei stato sopraffatto. Hai eliminato ${kills} non-morti.<br>Rottami raccolti: ${scrap}.`;
    ui.start.textContent="RIPROVA";
  }
}
function startGame() {
  health=100; ammo=12; reserve=48; scrap=0; wave=1; kills=0; spawnTimer=2;
  enemies.forEach(e=>scene.remove(e.group)); enemies.length=0;
  loots.forEach(l=>scene.remove(l.mesh)); loots.length=0;
  ui.overlay.style.display="none"; playing=true; updateHud();
  renderer.domElement.requestPointerLock();
  spawnWave();
}
ui.start.addEventListener("click",startGame);
document.addEventListener("pointerlockchange",()=>{locked=document.pointerLockElement===renderer.domElement;});
document.addEventListener("keydown",e=>{
  keys[e.code]=true;
  if(e.code=== "KeyR")reload();
  if(e.code=== "Escape"&&playing&&!locked){
    ui.overlay.style.display="grid";
    ui.overlay.querySelector("h1")!.innerHTML="PAUSA";
    ui.overlay.querySelector(".intro")!.textContent="La frontiera aspetta. Torna a combattere.";
    ui.start.textContent="RIPRENDI";
    ui.start.onclick=()=>{ui.overlay.style.display="none";renderer.domElement.requestPointerLock();};
  }
});
document.addEventListener("keyup",e=>keys[e.code]=false);
document.addEventListener("mousemove",e=>{
  if(!locked||!playing)return;
  camera.rotation.order="YXZ";
  camera.rotation.y-=e.movementX*.0022;
  camera.rotation.x-=e.movementY*.0022;
  camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x,-1.35,1.35);
});
document.addEventListener("mousedown",e=>{if(e.button===0)shoot();});
renderer.domElement.addEventListener("click",()=>{if(playing&&!locked)renderer.domElement.requestPointerLock();});
function animate() {
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.04);
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.style.opacity="0";}
  if(fireCooldown>0)fireCooldown-=dt;
  if(reloadTimer>0){reloadTimer-=dt;if(reloadTimer<=0){const n=Math.min(12-ammo,reserve);ammo+=n;reserve-=n;updateHud();toast("CARICATORE PRONTO");}}
  if(damageFlash>0){damageFlash-=dt;if(damageFlash<=0)ui.damage.style.opacity="0";}
  if(playing&&locked) {
    const forward=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion); forward.y=0; forward.normalize();
    const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion); right.y=0; right.normalize();
    const move=new THREE.Vector3();
    if(keys.KeyW)move.add(forward); if(keys.KeyS)move.sub(forward);
    if(keys.KeyD)move.add(right); if(keys.KeyA)move.sub(right);
    if(move.lengthSq()>0) {
      move.normalize().multiplyScalar((keys.ShiftLeft?8:5)*dt);
      camera.position.add(move);
    }
    camera.position.x=THREE.MathUtils.clamp(camera.position.x,-8,8);
    camera.position.z=THREE.MathUtils.clamp(camera.position.z,-9,12);
    camera.position.y=THREE.MathUtils.lerp(camera.position.y,keys.Space?3.2:2.2,dt*8);
    train.position.z=Math.sin(performance.now()*.00045)*.16;
    recoil=THREE.MathUtils.damp(recoil,0,12,dt); weapon.position.z=-.72+recoil;
    for(const enemy of [...enemies]) {
      const dir=new THREE.Vector3().subVectors(camera.position,enemy.group.position); dir.y=0;
      const dist=dir.length();
      if(dist>1.55){dir.normalize();enemy.group.position.addScaledVector(dir,enemy.speed*dt);}
      else {enemy.attack-=dt;if(enemy.attack<=0){enemy.attack=.85;damagePlayer(7+Math.random()*4);}}
      enemy.group.lookAt(camera.position.x,0,camera.position.z);
      enemy.group.position.y=Math.abs(Math.sin(performance.now()*.004+enemy.group.position.x))*.035;
    }
    for(const loot of loots) {
      if(!loot.taken&&loot.mesh.position.distanceTo(new THREE.Vector3(camera.position.x,0,camera.position.z))<1.8) {
        loot.taken=true; scrap+=5; reserve+=6; scene.remove(loot.mesh); toast("+5 ROTTAMI • +6 MUNIZIONI"); updateHud();
      }
      loot.mesh.rotation.y+=dt;
    }
    spawnTimer-=dt;
    if(spawnTimer<=0&&enemies.length===0) { wave++;spawnWave();spawnTimer=3; }
    if(spawnTimer<=0&&enemies.length>0)spawnTimer=2;
  }
  renderer.render(scene,camera);
}
animate();
addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
updateHud();
