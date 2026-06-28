// information_breather v7_3 - 描画ロジック (DOM更新, SVGアニメーション, render(), 起動シーケンス)
const STAT_DOM={'構造度':'statStructure','意味容量':'statMeaning','共鳴度':'statResonance','作用力':'statForce','洞察力':'statInsight'};

/* キャラの吹き出し(ダメージ/レベルアップ時の短いリアクション) */
let _speechTimer=null;
function showSpeech(text){
  const el=document.getElementById('speechBubble');
  if(!el) return;
  el.textContent=text;
  el.classList.add('show');
  if(typeof _seGameStarted!=='undefined' && _seGameStarted) sfxDepart();
  if(_speechTimer && typeof clearTimeout==='function') clearTimeout(_speechTimer);
  if(typeof setTimeout==='function'){
    _speechTimer=setTimeout(()=>{ el.classList.remove('show'); }, 2800);
  }
}

/* ===== 存在安定度リング: 6分割色相環を、ゲージ値に応じて先頭から塗りつぶす ===== */
const GAUGE_RING_C=2*Math.PI*92; // 約578.05
const GAUGE_SEG_LEN=GAUGE_RING_C/6; // 約96.34
function updateGaugeRing(gauge){
  const total=(Math.max(0,Math.min(100,gauge))/100)*GAUGE_RING_C;
  for(let i=0;i<6;i++){
    const visible=Math.max(0, Math.min(GAUGE_SEG_LEN, total - i*GAUGE_SEG_LEN));
    const seg=document.getElementById('gaugeSeg'+i);
    seg.setAttribute('stroke-dasharray', visible.toFixed(2)+' '+(GAUGE_RING_C-visible).toFixed(2));
  }
}

/* ===== 装飾要素 ===== */
/* ===== 波形グラフ(info-display背景) ===== */
let _wavePhase=0;
function drawWave(){
  const canvas=document.getElementById('waveCanvas');
  if(!canvas || !canvas.getContext) return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  if(s.runStatus!=='観測中') return;

  const g=s.gauge/100;
  const amp=H*0.12+H*0.22*Math.abs(g-0.5)*2;
  const freq=1.5+(g<0.5?(0.5-g)*3:(g-0.5)*2);
  const speed=0.8+Math.abs(g-0.5)*2;
  const r=g<0.5?Math.round(80+80*g*2):Math.round(160+80*(g-0.5)*2);
  const gv=g<0.5?Math.round(160+60*g*2):Math.round(220-60*(g-0.5)*2);
  const b=g<0.5?Math.round(240-60*g*2):Math.round(180-120*(g-0.5)*2);
  const color='rgb('+r+','+gv+','+b+')';
  _wavePhase+=speed*0.05;

  for(let wave=0;wave<2;wave++){
    const phaseOff=wave*Math.PI*0.7;
    const ampMult=wave===0?1.0:0.55;
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.lineWidth=wave===0?1.5:1.0;
    ctx.globalAlpha=wave===0?0.55:0.3;
    for(let x=0;x<=W;x++){
      const prog=x/W;
      const y=H/2
        +Math.sin(prog*Math.PI*2*freq+_wavePhase+phaseOff)*amp*ampMult
        +Math.sin(prog*Math.PI*4*freq*0.7+_wavePhase*1.3+phaseOff)*amp*0.35*ampMult
        +Math.sin(prog*Math.PI*freq*3.1+_wavePhase*0.8)*amp*0.2*ampMult;
      x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha=1;
}

/* ===== 重複アイテムを流れ星のように画面外へ ===== */
// 5方向の星型パス(中心基準、半径5相当)。文字グリフでなく図形描画にして軽量化する
const STAR_PATH_D='M0,-5 L1.18,-1.55 L4.76,-1.55 L1.79,0.59 L2.94,4 L0,1.85 L-2.94,4 L-1.79,0.59 L-4.76,-1.55 L-1.18,-1.55 Z';
function flowAwayStars(rejected, fixedAngle){
  const svg=document.getElementById('resultFx');
  if(!svg) return;
  const NS='http://www.w3.org/2000/svg';
  rejected.forEach((d)=>{
    const angle=(fixedAngle!==undefined) ? fixedAngle : Math.random()*Math.PI*2;
    const r=105+d.rank*3;
    const sx=102+Math.cos(angle)*r;
    const sy=102+Math.sin(angle)*r;
    // 画面外へ向かう方向(viewBox境界のすぐ内側まで。.col-leftのoverflow:hiddenでクリップされない範囲)
    const exDist=100;
    const ex=102+Math.cos(angle)*exDist;
    const ey=102+Math.sin(angle)*exDist;
    const baseScale=(5+d.rank*1.5)/5;
    const g=document.createElementNS(NS,'g');
    const path=document.createElementNS(NS,'path');
    path.setAttribute('d',STAR_PATH_D);
    path.setAttribute('fill','#e8d860');
    g.appendChild(path);
    g.setAttribute('transform','translate('+sx.toFixed(1)+','+sy.toFixed(1)+') scale('+baseScale.toFixed(2)+')');
    g.setAttribute('opacity','0.9');
    svg.appendChild(g);
    sfxObstacle();
    const dur=600;
    const t0=performance.now();
    function frame(){
      const prog=Math.min(1,(performance.now()-t0)/dur);
      const ease=prog*prog;
      const cx=sx+(ex-sx)*ease;
      const cy=sy+(ey-sy)*ease;
      g.setAttribute('transform','translate('+cx.toFixed(1)+','+cy.toFixed(1)+') scale('+baseScale.toFixed(2)+')');
      g.setAttribute('opacity',(0.9*(1-prog)).toFixed(2));
      if(prog<1){
        requestAnimationFrame(frame);
      }else{
        if(g.parentNode) g.parentNode.removeChild(g);
      }
    }
    requestAnimationFrame(frame);
  });
}


function absorbStars(absorbed, fixedAngle){
  const svg=document.getElementById('resultFx');
  if(!svg) return;
  const NS='http://www.w3.org/2000/svg';
  absorbed.forEach((d)=>{
    const angle=(fixedAngle!==undefined) ? fixedAngle : Math.random()*Math.PI*2;
    const r=105+d.rank*3;
    const sx=102+Math.cos(angle)*r;
    const sy=102+Math.sin(angle)*r;
    const baseScale=(5+d.rank*1.5)/5;
    const g=document.createElementNS(NS,'g');
    const path=document.createElementNS(NS,'path');
    path.setAttribute('d',STAR_PATH_D);
    path.setAttribute('fill','#e8d860');
    g.appendChild(path);
    g.setAttribute('transform','translate('+sx.toFixed(1)+','+sy.toFixed(1)+') scale('+baseScale.toFixed(2)+')');
    g.setAttribute('opacity','1');
    svg.appendChild(g);
    sfxAbsorb();
    const dur=700;
    const t0=performance.now();
    function frame(){
      const prog=Math.min(1,(performance.now()-t0)/dur);
      const ease=1-Math.pow(1-prog,2);
      const cx=sx+(102-sx)*ease;
      const cy=sy+(102-sy)*ease;
      const sc=Math.max(0, baseScale*(1+0.6*Math.min(1,prog*2))*(prog<0.7?1:(1-(prog-0.7)/0.3)));
      g.setAttribute('transform','translate('+cx.toFixed(1)+','+cy.toFixed(1)+') scale('+sc.toFixed(2)+')');
      g.setAttribute('opacity',(1-prog).toFixed(2));
      if(prog<1){
        requestAnimationFrame(frame);
      }else{
        if(g.parentNode) g.parentNode.removeChild(g);
      }
    }
    requestAnimationFrame(frame);
  });
}


function buildRings(){
  const g=document.getElementById('rings'); g.innerHTML='';
  const radii=[45,58,71,84];
  const count=Math.min(4, 1+Math.floor(s.found.length/4));
  for(let i=0;i<count;i++){
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('class','ring'); c.setAttribute('cx','100'); c.setAttribute('cy','100');
    c.setAttribute('r',radii[i]); g.appendChild(c);
  }
}
function fairyBody(tier, fill){
  if(tier<=1) return '<circle r="4" fill="'+fill+'"/>';
  if(tier<=3) return '<rect x="-3.4" y="-3.4" width="6.8" height="6.8" rx="1.2" fill="'+fill+'" transform="rotate(45)"/>';
  if(tier===4) return '<path d="M0,-4.6 L1.3,-1.3 L4.6,0 L1.3,1.3 L0,4.6 L-1.3,1.3 L-4.6,0 L-1.3,-1.3 Z" fill="'+fill+'"/>';
  return '<path d="M0,3.4 C-4,0.6 -3.6,-3.4 0,-1.4 C3.6,-3.4 4,0.6 0,3.4 Z" fill="'+fill+'"/>';
}
/* buff_statごとに形を変える(色はTierで固定) */
function fairyBodyByAxis(axisStat, fill){
  switch(axisStat){
    case '構造度': // 四角(構造)
      return '<rect x="-3.4" y="-3.4" width="6.8" height="6.8" rx="1.2" fill="'+fill+'" transform="rotate(45)"/>';
    case '意味容量': // 六角形(意味の広がり)
      return '<path d="M4.2,0 L2.1,3.64 L-2.1,3.64 L-4.2,0 L-2.1,-3.64 L2.1,-3.64 Z" fill="'+fill+'"/>';
    case '共鳴度': // 円(共鳴・波)
      return '<circle r="4" fill="'+fill+'"/>';
    case '作用力': // 8方向の星(力の発散)
      return '<path d="M0,-4.6 L1.3,-1.3 L4.6,0 L1.3,1.3 L0,4.6 L-1.3,1.3 L-4.6,0 L-1.3,-1.3 Z" fill="'+fill+'"/>';
    case '洞察力': // 花弁/瞳形(洞察)
      return '<path d="M0,3.4 C-4,0.6 -3.6,-3.4 0,-1.4 C3.6,-3.4 4,0.6 0,3.4 Z" fill="'+fill+'"/>';
    default: // axis_statなし(主にTier0) → 円
      return '<circle r="4" fill="'+fill+'"/>';
  }
}
function buildParticles(){
  const g=document.getElementById('particles');
  let html='';
  s.committed.forEach((id,i)=>{
    const n=NODES[id];
    const angle=(360/Math.max(3,s.committed.length))*i*(Math.PI/180);
    const r=50+(i%3)*16;
    const x=100+r*Math.cos(angle), y=100+r*Math.sin(angle);
    const fill=TIER_COLOR[n.tier];
    const fledged=n.tier>=3;
    html += '<g transform="translate('+x+','+y+')"><g class="fairy" style="animation-delay:'+(i*0.5)+'s"><g transform="scale(1.6)">';
    if(fledged){
      html += '<ellipse class="wing" cx="-3.2" cy="0.5" rx="2.6" ry="1.4"/>';
      html += '<ellipse class="wing" cx="3.2" cy="0.5" rx="2.6" ry="1.4"/>';
    }
    html += fairyBodyByAxis(n.buffStat, fill);
    html += '<circle class="eye" cx="-1.3" cy="-0.6" r="0.9"/><circle class="eye" cx="1.3" cy="-0.6" r="0.9"/>';
    html += '<circle class="pupil" cx="-1.3" cy="-0.6" r="0.4"/><circle class="pupil" cx="1.3" cy="-0.6" r="0.4"/>';
    html += '</g></g></g>';
  });
  g.innerHTML=html;
}

/* ===== 星フィールド(情報の海) ===== */
// シード付き疑似乱数(再正規化→出発で同じパターンにリセット)
let _starSeed=42;
function _rng(){ _starSeed=(_starSeed*1664525+1013904223)&0xffffffff; return ((_starSeed>>>0)/0xffffffff); }
let _starCache=[]; // 全星データ(MAX_STARS個分)を事前生成
const MAX_STARS=1800;
const STAR_INFO_MAX=50000;
const CX=102, CY=102, INNER_R=84; // 中心・内側マスクの半径

function initStars(){
  _starSeed=42; _starCache=[];
  const W=340, H=256; // orb-wrap全幅
  const cx=170, cy=128; // 画面中央(銀河の中心)
  const maxR=200; // 渦の届く最大半径
  const armCount=3; // 渦状アームの本数
  const armSpin=2.4; // アームの巻き具合(大きいほどぐるぐる巻く)
  let attempts=0;
  while(_starCache.length<MAX_STARS && attempts<MAX_STARS*8){
    attempts++;
    let x,y;
    if(_rng()<0.7){
      // 渦状アームに沿って配置(銀河の主構造)
      const arm=Math.floor(_rng()*armCount);
      const armOffset=(arm/armCount)*Math.PI*2;
      const t=_rng(); // 中心からの進行度(0〜1)
      const angle=armOffset + t*Math.PI*armSpin;
      const r=t*maxR;
      // アームからのばらつき(ガウス近似、中心ほど密に・外側ほど広がる)
      const spread=(_rng()+_rng()+_rng()-1.5)*(0.25+t*0.5);
      const finalAngle=angle+spread;
      x=cx+Math.cos(finalAngle)*r;
      y=cy+Math.sin(finalAngle)*r*0.62; // 縦方向を圧縮して傾いた円盤状に
    }else{
      // 背景に薄く広がる星々(銀河の外縁・銀河間の星)
      x=_rng()*W; y=_rng()*H;
    }
    if(x<0||x>W||y<0||y>H) continue;
    // ゲージ中心(約170,130)付近を除外
    const dx=x-170, dy=y-130, dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<90) continue;
    const r=0.25+_rng()*0.55;
    const bright=_rng()<0.06;
    const baseOp=bright?(0.65+_rng()*0.30):(0.25+_rng()*0.5);
    const minOp=bright?0.05:Math.max(0.03, baseOp-0.45);
    const peakOp=bright?1.0:Math.min(1.0, baseOp+0.3);
    const dur=(1.8+_rng()*6.0).toFixed(1);
    const delay=(_rng()*-8).toFixed(1);
    const col=bright?'#ffffff':['#a8c4f0','#c0d8ff','#b0c8ff','#d0e4ff','#c8dcff','#ffffff'][Math.floor(_rng()*6)];
    _starCache.push({x:x.toFixed(1),y:y.toFixed(1),r:(bright?r+0.25:r).toFixed(2),
      op:baseOp.toFixed(2),minOp:minOp.toFixed(2),peakOp:peakOp.toFixed(2),
      dur,delay,bright,col});
  }
}
let _prevStarCount=-1;
function updateStarField(){
  if(_starCache.length===0) initStars();
  const ratio=Math.min(1, s.runInfo/STAR_INFO_MAX);
  const count=Math.round(30+ratio*(MAX_STARS-30));
  if(count===_prevStarCount) return;
  _prevStarCount=count;
  const g=document.getElementById('starCanvas');
  if(!g) return;
  const NS='http://www.w3.org/2000/svg';
  while(g.children && g.children.length>count) g.removeChild(g.lastChild);
  for(let i=(g.children?g.children.length:0);i<count;i++){
    const d=_starCache[i]; if(!d) break;
    const c=document.createElementNS(NS,'circle');
    c.setAttribute('cx',d.x); c.setAttribute('cy',d.y); c.setAttribute('r',d.r);
    c.setAttribute('fill',d.col||'#ffffff'); c.setAttribute('opacity',d.minOp);
    if(d.bright) c.setAttribute('filter','url(#starGlowLocal)');
    const a=document.createElementNS(NS,'animate');
    a.setAttribute('attributeName','opacity');
    a.setAttribute('values',d.minOp+';'+d.peakOp+';'+d.minOp);
    a.setAttribute('dur',d.dur+'s'); a.setAttribute('begin',d.delay+'s');
    a.setAttribute('repeatCount','indefinite');
    c.appendChild(a);
    if(d.bright){
      const ar=document.createElementNS(NS,'animate');
      ar.setAttribute('attributeName','r');
      ar.setAttribute('values',d.r+';'+(parseFloat(d.r)*1.6).toFixed(1)+';'+d.r);
      ar.setAttribute('dur',d.dur+'s'); ar.setAttribute('begin',d.delay+'s');
      ar.setAttribute('repeatCount','indefinite');
      c.appendChild(ar);
    }
    g.appendChild(c);
  }
}

function resetStarField(){
  _starSeed=42; _starCache=[]; _prevStarCount=-1;
  const g=document.getElementById('starCanvas');
  if(g) g.innerHTML='';
  initStars();
  scheduleShootingStar();
}

/* ===== 流れ星 ===== */
let _shootingStarTimer=null;
function scheduleShootingStar(){
  if(_shootingStarTimer) clearTimeout(_shootingStarTimer);
  const ri=s.runInfo||0;
  if(ri<100){ _shootingStarTimer=setTimeout(scheduleShootingStar, 5000); return; }
  const interval=600/(ri/100)*1000; // ms
  const wait=Math.random()*interval;
  _shootingStarTimer=setTimeout(()=>{
    spawnShootingStar();
    scheduleShootingStar();
  }, wait);
}
function spawnShootingStar(){
  const g=document.getElementById('starCanvas');
  if(!g) return;
  const NS='http://www.w3.org/2000/svg';
  const W=340, H=256;

  // 画面4辺のいずれかからスタート
  const side=Math.floor(Math.random()*4);
  let x1,y1;
  if(side===0){ x1=Math.random()*W; y1=0; }
  else if(side===1){ x1=W; y1=Math.random()*H; }
  else if(side===2){ x1=Math.random()*W; y1=H; }
  else { x1=0; y1=Math.random()*H; }

  // 中央付近に向かって流れる
  const tx=80+Math.random()*180, ty=60+Math.random()*130;
  const dx=tx-x1, dy=ty-y1;
  const dist=Math.sqrt(dx*dx+dy*dy)||1;
  const len=50+Math.random()*80;
  const ux=dx/dist, uy=dy/dist; // 単位ベクトル

  const dur=400+Math.random()*500; // ms
  const col=['#ffffff','#c8e0ff','#e8f0ff','#d0e8ff'][Math.floor(Math.random()*4)];

  const line=document.createElementNS(NS,'line');
  line.setAttribute('stroke',col);
  line.setAttribute('stroke-width','1.2');
  line.setAttribute('stroke-linecap','round');
  line.setAttribute('opacity','0');
  g.appendChild(line);

  const start=performance.now();
  function step(now){
    const prog=Math.min(1,(now-start)/dur);
    // 頭(先端): 0→len進む
    const headDist=prog*len;
    // 尾(始点): prog>0.4から追いかける
    const tailDist=Math.max(0,(prog-0.4)/0.6)*len;
    const hx=x1+ux*headDist, hy=y1+uy*headDist;
    const tx2=x1+ux*tailDist, ty2=y1+uy*tailDist;
    // opacity: 0→1(前半)→0(後半)
    const op=prog<0.3?(prog/0.3):Math.max(0,1-(prog-0.3)/0.7);
    line.setAttribute('x1',tx2.toFixed(1)); line.setAttribute('y1',ty2.toFixed(1));
    line.setAttribute('x2',hx.toFixed(1)); line.setAttribute('y2',hy.toFixed(1));
    line.setAttribute('opacity',(op*0.95).toFixed(2));
    if(prog<1) requestAnimationFrame(step);
    else if(line.parentNode) line.parentNode.removeChild(line);
  }
  requestAnimationFrame(step);
}

function buildWalls(){
  const g=document.getElementById('walls'); g.innerHTML='';
  s.wallsThisRun.forEach((name,i)=>{
    const div=document.createElement('div');
    div.className='wall-mark';
    div.title='';
    div.textContent=t(name);
    g.appendChild(div);
  });
}
function buildWallCountdown(){
  const el=document.getElementById('wallCountdown');
  if(s.runStatus!=='観測中'){ el.style.visibility='hidden'; return; }
  const frontier=s.wallsThisRun.length;
  if(frontier>=7){ el.style.visibility='hidden'; return; }
  const w=WALLS[frontier];
  el.style.visibility='visible';
  if(s.wallActive){
    el.innerHTML=tf('MSG_WALL_ACTIVE_T',{name:t(w.name),n:s.wallActive.remain});
  }else{
    el.textContent=tf('MSG_WALL_NEXT_T',{name:t(w.name),n:Math.floor(s.runInfo),max:w.info});
  }
}

/* 六角形バリア(中央のハニカム壁) */
const HEX_SIZE=11;
function hexPoints(cx,cy,size){
  let pts=[];
  for(let k=0;k<6;k++){
    const a=Math.PI/3*k;
    pts.push((cx+size*Math.cos(a)).toFixed(1)+','+(cy+size*Math.sin(a)).toFixed(1));
  }
  return pts.join(' ');
}
let _barrierBuilt=false;
let _prevFrontier=undefined, _prevReady=undefined, _prevFailType=undefined;
function ensureBarrier(){
  if(_barrierBuilt) return;
  const g=document.getElementById('barrierGroup');
  const NS='http://www.w3.org/2000/svg';
  const size=HEX_SIZE;
  for(let q=-2;q<=2;q++){
    for(let r=-2;r<=2;r++){
      if(Math.abs(q+r)>2) continue;
      const cx=100+size*Math.sqrt(3)*(q+r/2);
      const cy=100+size*1.5*r;
      let bx=cx-100, by=cy-100;
      const mag=Math.sqrt(bx*bx+by*by);
      if(mag<0.01){ const a=Math.random()*Math.PI*2; bx=Math.cos(a); by=Math.sin(a); }
      else { bx/=mag; by/=mag; }
      const dist=26+Math.random()*22;
      const rot=(Math.random()*320-160).toFixed(0);
      const delay=(Math.random()*0.18).toFixed(2);
      const poly=document.createElementNS(NS,'polygon');
      poly.setAttribute('points', hexPoints(cx,cy,size));
      poly.setAttribute('class','barrier-hex');
      if(poly.style){
        poly.style.setProperty('--bx',(bx*dist).toFixed(1));
        poly.style.setProperty('--by',(by*dist).toFixed(1));
        poly.style.setProperty('--brot',rot+'deg');
        poly.style.setProperty('--bdelay',delay+'s');
      }
      g.appendChild(poly);
    }
  }
  _barrierBuilt=true;
}
function updateBarrier(){
  const g=document.getElementById('barrierGroup');
  ensureBarrier();
  const hexes=g.children;
  const frontierNow = s.wallsThisRun.length>=7 ? null : s.wallsThisRun.length;
  const activeNow = !!s.wallActive;
  const setCls=(cls)=>{ for(let i=0;i<hexes.length;i++) hexes[i].setAttribute('class',cls); };

  if(frontierNow===null){
    setCls('barrier-hex');
    _prevFrontier=frontierNow; _prevReady=activeNow; _prevFailType=s.lastFailType;
    _lastWallAttack=null;
    return;
  }

  // 壁を新たに突破した直後(frontierが進んだ)
  if(_prevFrontier!==undefined && frontierNow>_prevFrontier){
    setCls('barrier-hex breaking');
    spawnBreakParticles();
    setTimeoutSafe(()=>{ setCls('barrier-hex'); }, 900);
  }
  // 時間切れ
  else if(_prevFailType!==s.lastFailType && s.lastFailType==='timeout'){
    setCls('barrier-hex dimming');
    setTimeoutSafe(()=>{ setCls('barrier-hex'); }, 1200);
  }
  else{
    setCls('barrier-hex'+(activeNow?' charged':''));
  }

  // 突破ロールに失敗した(壁が耐えた)瞬間の攻撃エフェクト
  if(_lastWallAttack==='miss'){
    spawnWallAttackParticle();
  }
  _lastWallAttack=null;

  _prevFrontier=frontierNow; _prevReady=activeNow; _prevFailType=s.lastFailType;
}

/* ===== 障害(攻撃エフェクト) ===== */
function setTimeoutSafe(fn, ms){
  if(typeof setTimeout==='function') setTimeout(fn, ms);
}
function spawnBreakParticles(){
  const fx=document.getElementById('fxGroup');
  if(!fx || typeof document.createElementNS!=='function') return;
  const raf = (typeof requestAnimationFrame==='function') ? requestAnimationFrame : (fn)=>setTimeoutSafe(fn,16);

  // 衝撃波リング(2枚、中心から外側へ拡大しながらフェード)
  const ringColors=['var(--rare)','var(--legend)'];
  ringColors.forEach((color,ri)=>{
    const ring=document.createElementNS('http://www.w3.org/2000/svg','circle');
    ring.setAttribute('cx','100'); ring.setAttribute('cy','100'); ring.setAttribute('r','8');
    ring.setAttribute('fill','none');
    if(ring.style){ ring.style.stroke=color; ring.style.strokeWidth='3'; }
    fx.appendChild(ring);
    const dur=700+ri*150, start=Date.now();
    (function step(){
      const prog=Math.min(1,(Date.now()-start)/dur);
      const ease=1-Math.pow(1-prog,3);
      ring.setAttribute('r',(8+ease*110).toFixed(1));
      ring.setAttribute('opacity',(1-ease).toFixed(2));
      if(ring.style) ring.style.strokeWidth=(3*(1-ease)+0.5).toFixed(2);
      if(prog<1) raf(step);
      else if(fx.removeChild) fx.removeChild(ring);
    })();
  });

  // 飛散パーティクル(大型・多数)
  const count=28;
  const colors=['var(--rare)','var(--legend)','#ffffff'];
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2;
    const dist=55+Math.random()*110;
    const x1=100+dist*Math.cos(angle), y1=100+dist*Math.sin(angle);
    const r0=3+Math.random()*5.5;
    const p=document.createElementNS('http://www.w3.org/2000/svg','circle');
    p.setAttribute('cx','100'); p.setAttribute('cy','100'); p.setAttribute('r',r0.toFixed(2));
    p.setAttribute('class','atk-particle');
    if(p.style) p.style.fill=colors[Math.floor(Math.random()*colors.length)];
    fx.appendChild(p);
    const dur=650+Math.random()*550, start=Date.now();
    (function step(){
      const prog=Math.min(1,(Date.now()-start)/dur);
      const ease=1-Math.pow(1-prog,2);
      p.setAttribute('cx',(100+(x1-100)*ease).toFixed(1));
      p.setAttribute('cy',(100+(y1-100)*ease).toFixed(1));
      p.setAttribute('r',(r0*(1-0.8*ease)).toFixed(2));
      p.setAttribute('opacity',(1-ease).toFixed(2));
      if(prog<1) raf(step);
      else if(fx.removeChild) fx.removeChild(p);
    })();
  }

  // 中心の閃光
  flashOrb('#ffffff');
}
function spawnAttackParticle(obstacle){
  const fx=document.getElementById('fxGroup');
  if(!fx || typeof document.createElementNS!=='function') return;
  const color = obstacle.side==='entropy' ? 'var(--entropy)' : obstacle.side==='wall' ? 'var(--rare)' : 'var(--coherent)';
  const angle=Math.random()*Math.PI*2;
  const x0=100+98*Math.cos(angle), y0=100+98*Math.sin(angle);
  const p=document.createElementNS('http://www.w3.org/2000/svg','circle');
  p.setAttribute('cx',x0.toFixed(1)); p.setAttribute('cy',y0.toFixed(1)); p.setAttribute('r','5.5');
  p.setAttribute('class','atk-particle');
  if(p.style) p.style.fill=color;
  fx.appendChild(p);
  const dur=650, start=Date.now();
  const raf = (typeof requestAnimationFrame==='function') ? requestAnimationFrame : (fn)=>setTimeoutSafe(fn,16);
  function step(){
    const prog=Math.min(1,(Date.now()-start)/dur);
    const ease=1-Math.pow(1-prog,2);
    p.setAttribute('cx',(x0+(100-x0)*ease).toFixed(1));
    p.setAttribute('cy',(y0+(100-y0)*ease).toFixed(1));
    p.setAttribute('r',(5.5*(1-0.7*ease)).toFixed(2));
    p.setAttribute('opacity',(1-0.6*ease).toFixed(2));
    if(prog<1){ raf(step); }
    else{
      if(fx.removeChild) fx.removeChild(p);
      flashOrb(color);
      sfxDamage();
      const sp=speechFor('damage');
      if(sp) showSpeech(t(sp));
    }
  }
  step();
}
/* 中心(観測点)から、バリア(中央六角形)方向へ攻撃の粒子を飛ばす(壁突破ロールの"ミス"演出) */
function spawnWallAttackParticle(){
  const fx=document.getElementById('fxGroup');
  if(!fx || typeof document.createElementNS!=='function') return;
  const angle=Math.random()*Math.PI*2;
  const targetR=42;
  const x1=100+targetR*Math.cos(angle), y1=100+targetR*Math.sin(angle);
  const p=document.createElementNS('http://www.w3.org/2000/svg','circle');
  p.setAttribute('cx','100'); p.setAttribute('cy','100'); p.setAttribute('r','5.5');
  p.setAttribute('class','atk-particle');
  if(p.style) p.style.fill='var(--rare)';
  fx.appendChild(p);
  const dur=500, start=Date.now();
  const raf = (typeof requestAnimationFrame==='function') ? requestAnimationFrame : (fn)=>setTimeoutSafe(fn,16);
  function step(){
    const prog=Math.min(1,(Date.now()-start)/dur);
    const ease=1-Math.pow(1-prog,2);
    p.setAttribute('cx',(100+(x1-100)*ease).toFixed(1));
    p.setAttribute('cy',(100+(y1-100)*ease).toFixed(1));
    p.setAttribute('r',(5.5*(1-0.5*ease)).toFixed(2));
    p.setAttribute('opacity',(1-0.7*ease).toFixed(2));
    if(prog<1){ raf(step); }
    else if(fx.removeChild) fx.removeChild(p);
  }
  step();
}
function flashOrb(color){
  const fg=document.getElementById('floatyGroup');
  if(!fg || !fg.classList) return;
  fg.classList.remove('orb-hit');
  if(fg.style) fg.style.setProperty('--hitcolor', color);
  if(fg.getBoundingClientRect) fg.getBoundingClientRect(); // SVG要素のリフローを強制(offsetWidthはSVGでは無効)
  fg.classList.add('orb-hit');
}
/* 待機中、キャラをクリックした時の「喜び」表現: ぽよよん拡縮+パーティクル散布+妖精くるくる回転 */
function playCharaJoyAnim(){
  const fg=document.getElementById('floatyGroup');
  if(fg && fg.classList){
    fg.classList.remove('chara-joy');
    if(fg.getBoundingClientRect) fg.getBoundingClientRect();
    fg.classList.add('chara-joy');
    setTimeoutSafe(()=>{ fg.classList.remove('chara-joy'); }, 600);
  }
  // 妖精(ノードの周りに浮かぶ図形)をくるくる回転させる
  const particles=document.getElementById('particles');
  if(particles && particles.querySelectorAll){
    const fairies=particles.querySelectorAll('.fairy');
    fairies.forEach(f=>{
      if(!f.classList) return;
      f.classList.remove('fairy-spin');
      if(f.getBoundingClientRect) f.getBoundingClientRect();
      f.classList.add('fairy-spin');
      setTimeoutSafe(()=>{ f.classList.remove('fairy-spin'); }, 700);
    });
  }
  // パーティクルを中心から放射状に散らす
  const fx=document.getElementById('fxGroup');
  if(!fx || typeof document.createElementNS!=='function') return;
  const colors=['#e8d860','#7ee8d0','#c8a0f0','#f0a0a0'];
  const n=10;
  for(let i=0;i<n;i++){
    const angle=(i/n)*Math.PI*2+Math.random()*0.3;
    const dist=30+Math.random()*20;
    const ex=100+Math.cos(angle)*dist, ey=100+Math.sin(angle)*dist;
    const p=document.createElementNS('http://www.w3.org/2000/svg','circle');
    p.setAttribute('cx','100'); p.setAttribute('cy','100'); p.setAttribute('r','3');
    p.setAttribute('fill', colors[i%colors.length]);
    p.setAttribute('opacity','1');
    fx.appendChild(p);
    const dur=550, start=Date.now();
    const raf = (typeof requestAnimationFrame==='function') ? requestAnimationFrame : (fn)=>setTimeoutSafe(fn,16);
    function step(){
      const prog=Math.min(1,(Date.now()-start)/dur);
      const ease=1-Math.pow(1-prog,2);
      p.setAttribute('cx',(100+(ex-100)*ease).toFixed(1));
      p.setAttribute('cy',(100+(ey-100)*ease).toFixed(1));
      p.setAttribute('opacity',(1-prog).toFixed(2));
      if(prog<1){ raf(step); }
      else{ if(fx.removeChild) fx.removeChild(p); }
    }
    step();
  }
}
function buildObstacles(){
  const wrap=document.getElementById('obstacleTitle');
  const g=document.getElementById('obstacles'); g.innerHTML='';
  wrap.style.display='block';
  if(s.activeObstacles.length===0){
    const div=document.createElement('div');
    div.className='none';
    div.textContent=t('UI_NO_OBSTACLE');
    g.appendChild(div);
    return;
  }
  s.activeObstacles.forEach(ao=>{
    const o=OBSTACLES.find(x=>x.key===ao.key);
    const div=document.createElement('div');
    div.className='obstacle-pill '+o.side;
    div.textContent=tf('MSG_OBSTACLE_REMAIN_T',{name:t(o.name),n:ao.remain});
    g.appendChild(div);
  });
}

/* ===== 概念グラフ・スロット ===== */
function buildGraph(scrollToNew){
  const g=document.getElementById('graph'); g.innerHTML='';
  let firstNewEl=null;
  let prevTierHasFound=true; // Tier0は常に開放(初期ノードがTier0のため)
  for(let tier=0;tier<=7;tier++){
    const allIds=NODE_IDS.filter(id=>NODES[id].tier===tier);
    const foundIds=allIds.filter(id=>s.found.includes(id));
    const tierUnlocked = tier===0 || prevTierHasFound;
    if(!tierUnlocked) break; // このTierも次のTierも、まだ表示しない(Tierがいくつあるかは伏せる)
    if(allIds.length===0){ prevTierHasFound=false; continue; }
    const label=document.createElement('div');
    label.className='tier-label';
    label.textContent=TIER_LABEL_IDS[tier]?t(TIER_LABEL_IDS[tier]):('Tier '+tier);
    label.style.color=TIER_COLOR[tier]||'var(--text-dim)';
    label.style.borderBottom='1px solid '+(TIER_COLOR[tier]||'var(--line)');
    label.style.opacity='0.85';
    g.appendChild(label);
    allIds.forEach(id=>{
      const n=NODES[id];
      const div=document.createElement('div');
      if(s.found.includes(id)){
        const committed=s.committed.includes(id);
        const isNew=s.newlyUnlocked && s.newlyUnlocked.includes(id);
        let cls='node-pill';
        if(tier>=5 && committed) cls+=' active';
        else if(committed) cls+=' committed';
        if(isNew) cls+=' is-new';
        div.innerHTML = t(n.name) + (isNew?'<span class="new-badge">NEW</span>':'');
        div.title=t(n.note);
        div.onclick=()=>toggleCommit(id);
        div.className=cls;
        div.style.borderLeftColor=TIER_COLOR[tier]||'var(--text-dim)';
        if(committed) div.style.background='color-mix(in srgb, '+(TIER_COLOR[tier]||'var(--text-dim)')+' 16%, transparent)';
        if(isNew && !firstNewEl) firstNewEl=div;
      }else{
        // 未発見: 名称は伏せ、グレー枠のみ。
        // Tier0は「必要情報量」のみ表示(情報量を増やせば解放される、というルールを学習させる)
        // Tier1以降は「発見に必要な前提ノード名」を表示
        div.className='node-pill node-unknown';
        div.innerHTML='???';
        let hintText;
        if(tier===0){
          hintText = n.infoTh!==null ? (t('HINT_INFO_TH')+n.infoTh) : t('UI_COND_UNSET');
        }else if(tier===7){
          const tier7hints={
            alpha:t('WALL_EMPTY'),
            lumina:t('WALL_SKY'),
            sg_structural:t('WALL_TRANSIT_STR'),
            sg_resonant:t('WALL_TRANSIT_RES'),
            sg_semantic:t('WALL_TRANSIT_SEM'),
            sg_insight:t('WALL_TRANSIT_INS'),
            sg_active:t('WALL_TRANSIT_ACT'),
          };
          hintText = tier7hints[id] || t('WALL_BEYOND');
        }else{
          const prereqNames=n.prereq.map(p=>'「'+NODES[p].name+'」').join('、');
          hintText = prereqNames ? (t('HINT_PREREQ')+prereqNames) : t('UI_NO_PREREQ');
        }
        div.title=hintText;
        // スマホ等ホバーできない環境向け: タップでも同じヒントをログに表示する
        div.onclick=()=>log(t('HINT_UNKNOWN')+hintText, 'dream');
        div.style.borderLeftColor='var(--text-dim)';
      }
      g.appendChild(div);
    });
    prevTierHasFound = foundIds.length>0;
  }

  // ===== Tier X（隠しノード）の表示 =====
  const txIds=NODE_IDS.filter(id=>NODES[id].tier===8);
  const txFound=txIds.filter(id=>s.found.includes(id));
  if(txFound.length>0){
    const txLabel=document.createElement('div');
    txLabel.className='tier-label';
    txLabel.textContent=t('TIER_X');
    txLabel.style.color=TIER_COLOR[8];
    txLabel.style.borderBottom='1px solid '+TIER_COLOR[8];
    txLabel.style.opacity='0.85';
    g.appendChild(txLabel);
    txIds.forEach(id=>{
      const n=NODES[id];
      const div=document.createElement('div');
      if(s.found.includes(id)){
        const committed=s.committed.includes(id);
        const isNew=s.newlyUnlocked && s.newlyUnlocked.includes(id);
        let cls='node-pill';
        if(committed) cls+=' active';
        if(isNew) cls+=' is-new';
        div.innerHTML=t(n.name)+(isNew?'<span class="new-badge">NEW</span>':'');
        div.title=t(n.note);
        div.onclick=()=>toggleCommit(id);
        div.className=cls;
        div.style.borderLeftColor=TIER_COLOR[8];
        if(committed) div.style.background='color-mix(in srgb, '+TIER_COLOR[8]+' 16%, transparent)';
        if(isNew && !firstNewEl) firstNewEl=div;
      }else{
        // 未発見: ？？？表示（grayout）
        div.className='node-pill node-unknown';
        div.style.borderLeftColor='var(--line)';
        div.onclick=()=>log(t('HINT_UNKNOWN')+t('UI_COND_UNSET'), 'dream');
        div.innerHTML='？？？';
      }
      g.appendChild(div);
    });
  }

  // NEWノードが見つかった場合、そこにスクロール
  if(scrollToNew && firstNewEl){
    setTimeout(()=>{
      firstNewEl.scrollIntoView({block:'nearest', behavior:'smooth'});
    }, 100);
  }
}
const BUFF_STAT_ID_MAP={
  '構造度':'LABEL_STAT_STR','意味容量':'LABEL_STAT_SEM',
  '共鳴度':'LABEL_STAT_RES','作用力':'LABEL_STAT_ACT','洞察力':'LABEL_STAT_INS'
};
function effText(n){
  const parts=[];
  if(n.buffStat){
    const id=BUFF_STAT_ID_MAP[n.buffStat];
    parts.push((id?t(id):t(n.buffStat))+' +'+n.buffVal);
  }
  if(n.intBuff) parts.push(t('LABEL_INTEGRITY')+' +'+n.intBuff);
  return parts.join(' / ');
}
function dirText(n){
  const nightmareMode=typeof s!=='undefined' && s.committed && s.committed.includes('tx_nightmare');
  const mult=nightmareMode?10:1;
  const diff=(n.ep-n.sp)*mult;
  if(Math.abs(diff)<0.005*mult) return '<div class="dir neutral">'+t('DIR_NEUTRAL')+' 0.00</div>';
  const dir = diff>0 ? t('DIR_DIFFUSE') : t('DIR_CONVERGE');
  const cls = diff>0 ? 'entropy' : 'silence';
  const blink = nightmareMode ? ' nightmare-blink' : '';
  return '<div class="dir '+cls+blink+'">'+dir+' '+Math.abs(diff).toFixed(2)+'</div>';
}
function buildSlots(){
  const slots=document.getElementById('slots'); slots.innerHTML='';
  for(let i=0;i<maxSlots();i++){
    const id=s.committed[i];
    const div=document.createElement('div');
    div.className='slot '+(id?'filled':'empty');
    if(id) div.style.borderColor=TIER_COLOR[NODES[id].tier];
    const extra=id?'<div class="eff">'+effText(NODES[id])+'</div>'+dirText(NODES[id]):'';
    div.innerHTML='<div class="name">'+(id?t(NODES[id].name):t('UI_SLOT_EMPTY'))+'</div>'+extra;
    if(id) div.onclick=()=>toggleCommit(id);
    slots.appendChild(div);
  }
}

let _prevCommittedSig=null, _prevFoundLen=-1, _prevLang=null;

// 属性ごとのキャラ画像セット(8Tier分)。render()とキャラコレクション画面の両方から参照する
const ATTR_IMAGES={
  'normal': TIRE_IMAGES,
  'resonant': typeof RESONANT_IMAGES!=='undefined' ? RESONANT_IMAGES : TIRE_IMAGES,
  'structural': typeof STRUCTURAL_IMAGES!=='undefined' ? STRUCTURAL_IMAGES : TIRE_IMAGES,
  'insight': typeof INSIGHT_IMAGES!=='undefined' ? INSIGHT_IMAGES : TIRE_IMAGES,
  'active': typeof ACTIVE_IMAGES!=='undefined' ? ACTIVE_IMAGES : TIRE_IMAGES,
  'semantic': typeof SEMANTIC_IMAGES!=='undefined' ? SEMANTIC_IMAGES : TIRE_IMAGES,
  'alpha': typeof ALPHA_IMAGES!=='undefined' ? ALPHA_IMAGES : TIRE_IMAGES,
  'lumina': typeof LUMINA_IMAGES!=='undefined' ? LUMINA_IMAGES : TIRE_IMAGES,
  'drak': typeof DRAK_IMAGES!=='undefined' ? DRAK_IMAGES : TIRE_IMAGES,
};
// コレクション画面での表示順・ラベル
const CHARA_COLLECTION_ATTRS=[
  {key:'normal', label:t('STAT_HARMONY')},
  {key:'structural', label:t('STAT_STRUCTURAL_S')},
  {key:'semantic', label:t('STAT_SEMANTIC_S')},
  {key:'resonant', label:t('STAT_RESONANCE_S')},
  {key:'active', label:t('STAT_ACTIVE_S')},
  {key:'insight', label:t('STAT_INSIGHT_S')},
  {key:'alpha', label:'Alpha'},
  {key:'lumina', label:'Lumina'},
  {key:'drak', label:'Drak'},
];

/* ===== メイン render ===== */
function render(){
  const stats=computeStats();
  const zone=gaugeZone();
  updateStarField();
  if(!_shootingStarTimer) scheduleShootingStar();
  drawWave();

  const invBadge=document.getElementById('inventoryNewBadge');
  if(invBadge){
    const show = hasAnyInventoryNewIndicator();
    invBadge.style.display = show ? '' : 'none';
    if(show){
      const btn=document.getElementById('tooltipInventory');
      if(btn){
        const r=btn.getBoundingClientRect();
        invBadge.style.left=(r.left+r.width/2)+'px';
        invBadge.style.top=(r.bottom+3)+'px';
      }
    }
  }

  document.getElementById('runInfo').textContent=Math.floor(s.runInfo);
  // Gainボーナス率の表示(初期状態を0%基準にオフセット表示)
  const gainBonusEl=document.getElementById('gainBonus');
  if(gainBonusEl){
    const knowledgeMultG=1+s.found.reduce((sum,id)=>{
      const n=NODES[id];
      return sum+(0.04+n.tier*0.03);
    },0);
    const gainMultGG=0.5+s.gauge/100;
    const integrityBonusG=s.integrity>=100?1.5:1.0;
    const itemBonusAddG = itemGainBonus()-1;
    // 意味属性: 発動時のみ意味容量に応じたGainボーナスが乗る(常時ではない)
    const semanticBonusAddG = detectAttr(stats)==='semantic' ? stats['意味容量']*0.004 : 0;
    const coreMultG=0.5*(1+s.level*0.008)*knowledgeMultG*gainMultGG*(1+s.depth*0.1);
    const totalMult=(coreMultG+itemBonusAddG+semanticBonusAddG)*integrityBonusG;
    // 初期状態(Lv1,gauge50,found3,depth0,壁0,item0,normal属性=意味ボーナス0): totalMult≈0.5645 → 約-44%
    // この値をオフセットとして加算し、初期=+0%表示にキャリブレーション
    const OFFSET=44;
    const pct=Math.round((totalMult-1)*100)+OFFSET;
    gainBonusEl.textContent=(pct>=0?'+':'')+pct+'%';
  }
  document.getElementById('gaugeVal').textContent=Math.round(s.gauge);
  const gl=document.getElementById('gaugeLabel');
  gl.textContent=zone.label; gl.style.color=zone.color;
  document.getElementById('lv').textContent=s.level;
  document.getElementById('totalInfo').textContent= s.metaUnlocks.infinity?'∞':Math.floor(s.totalInfo);
  document.getElementById('bestRunInfo').textContent= Math.floor(s.bestRunInfo);
  document.getElementById('depth').textContent=s.depth;
  const _rsMap={'観測中':'STATUS_OBSERVING','停止中':'STATUS_STOPPED','停止中(エントロピー拡散による終了)':'STATUS_ENTROPY','停止中(沈黙による終了)':'STATUS_SILENCE','停止中(時間切れによる終了)':'STATUS_TIMEOUT','停止中(再正規化)':'STATUS_RENORM','停止中(準備中)':'STATUS_READY'};
  const _rsLabel=document.getElementById('runStatusBadge');
  if(_rsLabel){
    _rsLabel.textContent=t(_rsMap[s.runStatus]||'STATUS_STOPPED');
    _rsLabel.style.color=s.runStatus==='観測中'?'#f0b040':'#8899aa';
  }
  const _rsLabel2=document.getElementById('runStatusLabel');
  if(_rsLabel2){
    _rsLabel2.textContent=t(_rsMap[s.runStatus]||'STATUS_STOPPED');
    _rsLabel2.style.color=s.runStatus==='観測中'?'#f0b040':'#8899aa';
  }
  document.getElementById('maxSlotsLabel').textContent=maxSlots();

  // 属性条件を満たすパラメータを黄色で強調(キャラ判定と完全同期)
  const tireIdx=s.tireIdxDisplay!==undefined ? Math.min(7,s.tireIdxDisplay) : Math.min(7, s.wallsThisRun.length);
  const attr=detectAttr(stats);
  // 視認済みキャラ形態(属性×Tier)を記録(コレクション画面用)
  const charaSeenKey=attr+'_'+tireIdx;
  if(!s.charaSeen[charaSeenKey]) s.charaSeen[charaSeenKey]=true;
  const ATTR_STAT_MAP={structural:'構造度',semantic:'意味容量',resonant:'共鳴度',active:'作用力',insight:'洞察力'};
  const attrKey=ATTR_STAT_MAP[attr]||null;
  // 特異点ノードが発動しているか判定
  const committedSingularity=s.committed.find(id=>SINGULARITY_IDS.includes(id));
  let singularityStat=null;
  if(committedSingularity){
    const otherTier7=s.committed.some(id=>id!==committedSingularity && NODES[id].tier===7);
    if(!otherTier7) singularityStat=SINGULARITY_STAT_MAP[committedSingularity];
  }
  STAT_KEYS.forEach(k=>{
    const el=document.getElementById(STAT_DOM[k]);
    if(!el) return;
    if(k===singularityStat){
      el.textContent='∞';
      el.style.color='#e8d860';
    }else{
      el.textContent=stats[k];
      el.style.color=(k===attrKey)?'#e8d860':'';
    }
  });
  document.getElementById('statIntegrity').textContent=Math.floor(s.integrity)+'%';
  // 整合率100%時: 金色明滅
  const isCrit=s.integrity>=100;
  const intEl=document.getElementById('statIntegrity');
  intEl.classList.toggle('integrity-crit', isCrit);
  if(gainBonusEl) gainBonusEl.classList.toggle('integrity-crit', isCrit);

  updateGaugeRing(s.gauge);

  const intRing=document.getElementById('intRing');
  const intCircumference=2*Math.PI*98;
  intRing.setAttribute('stroke-dasharray', intCircumference);
  intRing.setAttribute('stroke-dashoffset', intCircumference*(1-s.integrity/100));
  intRing.classList.toggle('integrity-crit', isCrit);

  const active5=s.committed.some(id=>NODES[id].tier>=5);
  const orbColor=active5?'var(--legend)':zone.color;
  document.getElementById('orbGlow').style.fill=orbColor;
  const lifefluxEl=document.getElementById('lifefluxBadge');
  lifefluxEl.style.visibility='hidden'; // 「意味場が形成されている」バッジ表示はオミット(オーブの色変化は維持)

  const imgSet=ATTR_IMAGES[attr]||TIRE_IMAGES;
  const tireImg=document.getElementById('tireImg');
  const prevSrc=tireImg.getAttribute('href');
  const nextSrc=imgSet[tireIdx];
  if(prevSrc!==nextSrc){
    tireImg.setAttribute('href', nextSrc);
    if(prevSrc){
      const fg=document.getElementById('floatyGroup');
      fg.classList.remove('evolving');
      if(fg.getBoundingClientRect) fg.getBoundingClientRect();
      fg.classList.add('evolving');
      setTimeoutSafe(()=>{ fg.classList.remove('evolving'); }, 1000);
    }
  }

  const dur=Math.max(1.5, 5-stats['洞察力']*0.02);
  document.getElementById('orbGroup').style.animationDuration=dur+'s';

  // ラン中ドロップの衛星表示(ゲージより外側)。差分更新: 既存のg要素は再利用し、浮遊アニメのループを継続させる
  const dropFx=document.getElementById('dropFx');
  if(dropFx){
    if(!window._dropFxNodes) window._dropFxNodes={};
    const drops=s.runDrops;
    const NS='http://www.w3.org/2000/svg';
    const liveKeys={};
    drops.forEach((d)=>{
      const key = d.uid!==undefined ? ('u'+d.uid) : (d.itemId+'_'+(d.angle!==undefined?d.angle.toFixed(3):'0'));
      liveKeys[key]=true;
      const angle = d.angle!==undefined ? d.angle : 0;
      const r=105+d.rank*3;
      const cx=102+Math.cos(angle)*r, cy=102+Math.sin(angle)*r;
      const scale=(5+d.rank*1.5)/5;
      const rankSuffix=d.rank===0?'':' +'+d.rank;
      let entry=window._dropFxNodes[key];
      if(!entry){
        const g=document.createElementNS(NS,'g');
        const path=document.createElementNS(NS,'path');
        path.setAttribute('d',STAR_PATH_D);
        path.setAttribute('fill','#e8d860');
        path.setAttribute('opacity','0.9');
        g.appendChild(path);
        const title=document.createElementNS(NS,'title');
        title.textContent=DROP_ITEMS[d.itemId].name+rankSuffix;
        g.appendChild(title);
        dropFx.appendChild(g);
        entry={g, title, cx, cy, scale, t0:performance.now(), phase:Math.random()*Math.PI*2};
        window._dropFxNodes[key]=entry;
        const floatAmp=2+d.rank*0.5, floatDur=2000+(key.length*37)%900;
        (function floatLoop(){
          if(!window._dropFxNodes[key]) return; // 既に除去済みなら停止
          const e=window._dropFxNodes[key];
          const prog=(performance.now()-e.t0)/floatDur;
          const dy=Math.sin(prog*Math.PI*2+e.phase)*floatAmp;
          e.g.setAttribute('transform','translate('+e.cx.toFixed(1)+','+(e.cy+dy).toFixed(1)+') scale('+e.scale.toFixed(2)+')');
          requestAnimationFrame(floatLoop);
        })();
      }else{
        // 座標(ランク変化やレイアウト変化)のみ更新。アニメ位相は維持
        entry.cx=cx; entry.cy=cy; entry.scale=scale;
        entry.title.textContent=DROP_ITEMS[d.itemId].name+rankSuffix;
      }
    });
    // 表示されなくなったdrop(統合/散逸/ラン終了)のノードを除去
    Object.keys(window._dropFxNodes).forEach(key=>{
      if(!liveKeys[key]){
        const entry=window._dropFxNodes[key];
        if(entry.g.parentNode) entry.g.parentNode.removeChild(entry.g);
        delete window._dropFxNodes[key];
      }
    });
  }
  buildWalls(); buildWallCountdown(); updateBarrier();
  const _langChanged = (typeof _prevLang !== 'undefined') && _prevLang !== s.lang;
  buildObstacles(); buildGraph(s.found.length!==_prevFoundLen || _langChanged); buildSlots();
  const _nmOv=document.getElementById('nightmareOverlay');
  if(_nmOv) _nmOv.classList.toggle('active', s.committed.includes('tx_nightmare'));

  const committedSig=s.committed.join(',');
  if(committedSig!==_prevCommittedSig || _langChanged){ buildParticles(); _prevCommittedSig=committedSig; }
  if(s.found.length!==_prevFoundLen || _langChanged){ buildRings(); _prevFoundLen=s.found.length; }
  _prevLang = s.lang;

  const departBtn=document.getElementById('departBtn');
  const renormBtn=document.getElementById('renormBtn');
  if(s.pendingResult){
    departBtn.style.display='';
    departBtn.disabled=false;
    departBtn.textContent=t('UI_RESULT_CHECK');
    departBtn.classList.add('result-pending-btn');
    departBtn.onclick=function(){
      sfxButton();
      departBtn.classList.remove('result-pending-btn');
      showResultSequence();
      departBtn.onclick=function(){ sfxButton(); depart(); };
    };
    renormBtn.style.display='none';
  }else if(s.runStatus==='停止中'){
    departBtn.style.display='';
    departBtn.disabled=false;
    departBtn.textContent=t('UI_DEPART');
    departBtn.classList.remove('result-pending-btn');
    departBtn.onclick=function(){ depart(); };
    renormBtn.style.display='none';
  }else{
    departBtn.style.display='none';
    renormBtn.style.display='';
    const ready = s.integrity>=100;
    renormBtn.textContent = ready
      ? t('UI_RENORM_DEPTH')
      : t('UI_RENORM');
    renormBtn.classList.toggle('integrity-crit-btn', ready);
  }
}

/* ===== tick(障害出現時の攻撃エフェクトを追加) ===== */
tick = function(){
  if(s._resultSequenceActive) return; // リザルト確認演出中は競合防止のため毎秒更新を停止
  checkCharaJoyResetCondition();
  const before = s.activeObstacles.map(a=>a.key);
  coreTick(false);
  s.activeObstacles.forEach(ao=>{
    if(!before.includes(ao.key)){
      const o=OBSTACLES.find(x=>x.key===ao.key);
      spawnAttackParticle(o);
    }
  });
  render(); save();
};

offlineCatchup();
render(); save(); // 起動直後のcharaSeen等をlocalStorageに確実に保存
initTitleScreen();
initImportButton();
initSettings();
initBgmSelect();
// tireImg（キャラクター）クリックイベント
(function(){
  const tireImg=document.getElementById('tireImg');
  if(tireImg) tireImg.addEventListener('click', ()=>charaJoyClick());
})();
// 波形アニメーション(rAF)
(function waveLoop(){
  drawWave();
  requestAnimationFrame(waveLoop);
})();
// tickはPress Startまで停止（メーカーロゴ・タイトル表示中は不要）
// startTick()はinitTitleScreen内のstartGame()から呼ばれる

/* ===== アイテム取得ポップアップ ===== */
// アイテムポップアップ（achv/trackはキューで順番に表示）
const _itemPopupQueue=[];
let _itemPopupBusy=false;

function _showNextItemPopup(){
  if(_itemPopupBusy || _itemPopupQueue.length===0) return;
  const {type, name}=_itemPopupQueue.shift();
  _itemPopupBusy=true;
  _renderItemPopup(type, name, ()=>{
    _itemPopupBusy=false;
    _showNextItemPopup();
  });
}

function _renderItemPopup(type, name, onDone){
  const container=document.getElementById('itemPopupContainer');
  if(!container){ if(onDone) onDone(); return; }

  const iconMap={ 'node':'assets/item_00.png', 'achv':'assets/item_01.png', 'track':'assets/item_02.png', 'end':null };
  const labelMap={ 'node':'拡張データ', 'achv':'実績データ', 'track':'音源データ', 'end':null };

  const popup=document.createElement('div');
  popup.className='item-popup';

  if(iconMap[type]){
    const img=document.createElement('img');
    img.src=iconMap[type];
    popup.appendChild(img);
  }

  const text=document.createElement('span');
  if(labelMap[type]){
    const label=document.createElement('span');
    label.className='item-popup-label';
    label.textContent=labelMap[type]+'：';
    text.appendChild(label);
  }
  text.appendChild(document.createTextNode(name));
  popup.appendChild(text);

  container.appendChild(popup);
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ popup.classList.add('show'); }); });

  setTimeout(()=>{
    popup.classList.remove('show');
    popup.classList.add('hide');
    setTimeout(()=>{ popup.remove(); if(onDone) onDone(); }, 300);
  }, 5000);
}

function showItemPopup(type, name){
  if(!_seGameStarted) return;
  if(type==='node'){
    // 拡張データは即時表示（キューなし）
    _renderItemPopup(type, name, null);
  } else {
    // 実績・音源・終了通知はキューで順番に表示
    _itemPopupQueue.push({type, name});
    _showNextItemPopup();
  }
}
