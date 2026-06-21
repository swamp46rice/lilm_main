// information_breather v7_3 - サウンド (BGM制御 + Web Audio APIによるSE合成)
/* ===== 音声(SFX/BGM): 効果音・BGM制御の宣言 ===== */
let sfxCtx=null, seOn=true, sfxNodes=null;

/* ===== BGM楽曲定義 ===== */
// Base64音源は各トラックのaudioId要素として<audio>タグをindex.htmlに用意する
// unlockCondition: null=最初から解放, それ以外は解放条件の説明(表示用)
// unlockKey: s.unlockedTracks内で管理するキー(track_0は常時解放)
const TRACKS = [
  { id: 'track_0', title: '♪ Dawn of civilization', audioId: 'bgmAudio', unlockKey: null },
  { id: 'track_1', title: '???', audioId: 'bgmAudio_1', unlockKey: 'track_1' },
  { id: 'track_2', title: '???', audioId: 'bgmAudio_2', unlockKey: 'track_2' },
  { id: 'track_3', title: '???', audioId: 'bgmAudio_3', unlockKey: 'track_3' },
  { id: 'track_4', title: '???', audioId: 'bgmAudio_4', unlockKey: 'track_4' },
  { id: 'track_5', title: '???', audioId: 'bgmAudio_5', unlockKey: 'track_5' },
  { id: 'track_6', title: '???', audioId: 'bgmAudio_6', unlockKey: 'track_6' },
  { id: 'track_7', title: '???', audioId: 'bgmAudio_7', unlockKey: 'track_7' },
  { id: 'track_8', title: '???', audioId: 'bgmAudio_8', unlockKey: 'track_8' },
  { id: 'track_9', title: '???', audioId: 'bgmAudio_9', unlockKey: 'track_9' },
  { id: 'track_10', title: '???', audioId: 'bgmAudio_10', unlockKey: 'track_10' },
  { id: 'track_11', title: '???', audioId: 'bgmAudio_11', unlockKey: 'track_11' },
  { id: 'track_12', title: '???', audioId: 'bgmAudio_12', unlockKey: 'track_12' },
];

let currentTrackIdx = 0;

/* ===== BGMプルダウン初期化 ===== */
function initBgmSelect(){
  const sel = document.getElementById('bgmTrackSelect');
  if(!sel) return;
  sel.innerHTML = '';
  TRACKS.forEach((t, i) => {
    const unlocked = !t.unlockKey || (typeof s !== 'undefined' && s.unlockedTracks && s.unlockedTracks.includes(t.unlockKey));
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = unlocked ? t.title : '???';
    opt.disabled = !unlocked;
    sel.appendChild(opt);
  });
  sel.value = currentTrackIdx;
  sel.addEventListener('change', ()=>{
    const idx = parseInt(sel.value);
    if(!isNaN(idx)) switchBgmTrack(idx);
  });
}

function updateBgmSelect(){
  const sel = document.getElementById('bgmTrackSelect');
  if(!sel) return;
  TRACKS.forEach((t, i) => {
    const opt = sel.options[i];
    if(!opt) return;
    const unlocked = !t.unlockKey || (typeof s !== 'undefined' && s.unlockedTracks && s.unlockedTracks.includes(t.unlockKey));
    opt.textContent = unlocked ? t.title : '???';
    opt.disabled = !unlocked;
  });
}

function switchBgmTrack(idx){
  const prev = TRACKS[currentTrackIdx];
  const prevAudio = document.getElementById(prev.audioId);
  if(prevAudio){ prevAudio.pause(); prevAudio.currentTime=0; }

  currentTrackIdx = idx;
  const track = TRACKS[currentTrackIdx];
  const audio = document.getElementById(track.audioId);
  if(audio && bgmAudioOn){
    audio.volume = 0.4;
    audio.loop = true;
    audio.play().catch(err=>log('BGM再生に失敗した: '+(err&&err.name?err.name:err)));
  }
  const sel = document.getElementById('bgmTrackSelect');
  if(sel) sel.value = currentTrackIdx;
}

/* ===== BGM ON/OFF ===== */
let bgmAudioOn=true;
function toggleBGMAudio(){
  const btn=document.getElementById('bgmAudioToggle');
  bgmAudioOn=!bgmAudioOn;
  const track = TRACKS[currentTrackIdx];
  const audio = document.getElementById(track.audioId);
  if(bgmAudioOn){
    if(audio){
      audio.volume=0.4;
      audio.loop=true;
      audio.play().catch(err=>log('BGM再生に失敗した: '+(err&&err.name?err.name:err)));
    }
    if(btn){ btn.textContent='♪ BGM: ON'; btn.classList.add('on'); }
  }else{
    if(audio){ audio.pause(); }
    if(btn){ btn.textContent='♪ BGM: OFF'; btn.classList.remove('on'); }
  }
}

/* ===== SE: 初期化・ON/OFFトグル ===== */
function initSE(){
  if(sfxCtx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return;
  sfxCtx=new AC();
  const sfxGain=sfxCtx.createGain();
  sfxGain.gain.value=0.7;
  sfxGain.connect(sfxCtx.destination);
  sfxNodes={sfxGain};
}

function toggleSE(){
  initSE();
  const btn=document.getElementById('bgmToggle');
  if(!sfxCtx){ if(btn) btn.textContent='♪ SE: (未対応)'; return; }
  seOn=!seOn;
  if(sfxCtx.state==='suspended') sfxCtx.resume();
  if(btn){
    btn.textContent='♪ SE: '+(seOn?'ON':'OFF');
    btn.classList.toggle('on', seOn);
  }
}

/* ===== SFX: 各イベントの効果音本体 ===== */
function sfxGate(){
  if(!seOn) return false;
  if(!sfxCtx) initSE();
  if(!sfxCtx) return false;
  if(sfxCtx.state==='suspended'){
    sfxCtx.resume();
    return false; // resume完了前は鳴らさない
  }
  return !!sfxNodes;
}

function noiseBuffer(duration){
  const len=Math.max(1,Math.floor(sfxCtx.sampleRate*duration));
  const buf=sfxCtx.createBuffer(1, len, sfxCtx.sampleRate);
  const data=buf.getChannelData(0);
  for(let i=0;i<len;i++) data[i]=Math.random()*2-1;
  return buf;
}

// 「問いを観測する(出発)」: 静かに広がるような上昇音
function sfxDepart(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  [330,440,554.37].forEach((f,i)=>{
    const osc=sfxCtx.createOscillator();
    osc.type='sine'; osc.frequency.value=f;
    const g=sfxCtx.createGain();
    const t0=now+i*0.06;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.12, t0+0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+0.9);
    osc.connect(g); g.connect(sfxNodes.sfxGain);
    osc.start(t0); osc.stop(t0+0.95);
  });
}

// ノード発見: 柔らかい三音のチャイム
function sfxDiscover(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  [880, 1108.73, 1318.51].forEach((f,i)=>{
    const osc=sfxCtx.createOscillator();
    osc.type='sine'; osc.frequency.value=f;
    const g=sfxCtx.createGain();
    const t0=now+i*0.05;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.16-i*0.03, t0+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+0.9);
    osc.connect(g); g.connect(sfxNodes.sfxGain);
    osc.start(t0); osc.stop(t0+0.95);
  });
}

// 位相の壁突破: ノイズの衝撃+下降音+上昇シマー
function sfxWallBreak(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  const src=sfxCtx.createBufferSource();
  src.buffer=noiseBuffer(0.3);
  const nf=sfxCtx.createBiquadFilter();
  nf.type='lowpass'; nf.frequency.value=1200;
  const ng=sfxCtx.createGain();
  ng.gain.setValueAtTime(0.4, now);
  ng.gain.exponentialRampToValueAtTime(0.0001, now+0.35);
  src.connect(nf); nf.connect(ng); ng.connect(sfxNodes.sfxGain);
  src.start(now); src.stop(now+0.35);

  const osc=sfxCtx.createOscillator();
  osc.type='sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(55, now+0.4);
  const og=sfxCtx.createGain();
  og.gain.setValueAtTime(0.35, now);
  og.gain.exponentialRampToValueAtTime(0.0001, now+0.5);
  osc.connect(og); og.connect(sfxNodes.sfxGain);
  osc.start(now); osc.stop(now+0.5);

  const osc2=sfxCtx.createOscillator();
  osc2.type='triangle';
  osc2.frequency.setValueAtTime(440, now);
  osc2.frequency.exponentialRampToValueAtTime(1760, now+0.6);
  const og2=sfxCtx.createGain();
  og2.gain.setValueAtTime(0, now);
  og2.gain.linearRampToValueAtTime(0.14, now+0.05);
  og2.gain.exponentialRampToValueAtTime(0.0001, now+0.7);
  osc2.connect(og2); og2.connect(sfxNodes.sfxGain);
  osc2.start(now); osc2.stop(now+0.7);
}

// 位相の壁: 突破ロール失敗(攻撃ミス) ―― 軽いノック音
function sfxAttackMiss(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  const src=sfxCtx.createBufferSource();
  src.buffer=noiseBuffer(0.1);
  const nf=sfxCtx.createBiquadFilter();
  nf.type='bandpass'; nf.frequency.value=700; nf.Q.value=0.9;
  const ng=sfxCtx.createGain();
  ng.gain.setValueAtTime(0.32, now);
  ng.gain.exponentialRampToValueAtTime(0.0001, now+0.12);
  src.connect(nf); nf.connect(ng); ng.connect(sfxNodes.sfxGain);
  src.start(now); src.stop(now+0.12);

  // 低音の「コッ」という当たり感を補強
  const osc=sfxCtx.createOscillator();
  osc.type='triangle';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(90, now+0.1);
  const og=sfxCtx.createGain();
  og.gain.setValueAtTime(0.18, now);
  og.gain.exponentialRampToValueAtTime(0.0001, now+0.1);
  osc.connect(og); og.connect(sfxNodes.sfxGain);
  osc.start(now); osc.stop(now+0.1);
}

// 再正規化 成功: 上昇アルペジオ
function sfxRenormSuccess(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  [261.63,329.63,392.00,523.25].forEach((f,i)=>{
    const osc=sfxCtx.createOscillator();
    osc.type='triangle'; osc.frequency.value=f;
    const g=sfxCtx.createGain();
    const t0=now+i*0.08;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.17, t0+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+0.7);
    osc.connect(g); g.connect(sfxNodes.sfxGain);
    osc.start(t0); osc.stop(t0+0.75);
  });
}

// 再正規化 失敗(深度変化なし): 下降してこもる音
function sfxRenormFail(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  const osc=sfxCtx.createOscillator();
  osc.type='sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(110, now+0.8);
  const f=sfxCtx.createBiquadFilter();
  f.type='lowpass'; f.frequency.value=500;
  const g=sfxCtx.createGain();
  g.gain.setValueAtTime(0.22, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now+0.9);
  osc.connect(f); f.connect(g); g.connect(sfxNodes.sfxGain);
  osc.start(now); osc.stop(now+0.9);
}

// レベルアップ: きらめく上昇音
function sfxLevelUp(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  const osc=sfxCtx.createOscillator();
  osc.type='sine';
  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.exponentialRampToValueAtTime(1046.5, now+0.35);
  const g=sfxCtx.createGain();
  g.gain.setValueAtTime(0.18, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now+0.4);
  osc.connect(g); g.connect(sfxNodes.sfxGain);
  osc.start(now); osc.stop(now+0.4);
}

// アイテム吸収: きらめくベル風の短いアルペジオ
function sfxAbsorb(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  const freqs=[1318.5, 1568.0, 2093.0]; // E6, G6, C7
  freqs.forEach((f,i)=>{
    const t=now+i*0.045;
    const osc=sfxCtx.createOscillator();
    osc.type='sine';
    osc.frequency.setValueAtTime(f, t);
    const g=sfxCtx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t+0.32);
    osc.connect(g); g.connect(sfxNodes.sfxGain);
    osc.start(t); osc.stop(t+0.34);
  });
}

// アイテムドロップ: 短く軽い「キラッ」という単発のきらめき音
function sfxItemDrop(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  const osc=sfxCtx.createOscillator();
  osc.type='triangle';
  osc.frequency.setValueAtTime(1760, now); // A6
  osc.frequency.exponentialRampToValueAtTime(2637, now+0.08); // E7
  const g=sfxCtx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.16, now+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now+0.22);
  osc.connect(g); g.connect(sfxNodes.sfxGain);
  osc.start(now); osc.stop(now+0.24);
  // わずかにシマー感を加えるための倍音
  const osc2=sfxCtx.createOscillator();
  osc2.type='sine';
  osc2.frequency.setValueAtTime(3520, now+0.02);
  const g2=sfxCtx.createGain();
  g2.gain.setValueAtTime(0.0001, now+0.02);
  g2.gain.exponentialRampToValueAtTime(0.06, now+0.03);
  g2.gain.exponentialRampToValueAtTime(0.0001, now+0.18);
  osc2.connect(g2); g2.connect(sfxNodes.sfxGain);
  osc2.start(now+0.02); osc2.stop(now+0.2);
}

// 障害発生: 「シュン」という短い移動音
function sfxObstacle(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  // 高音からの短い下降スイープ
  const osc=sfxCtx.createOscillator();
  osc.type='sine';
  osc.frequency.setValueAtTime(3000, now);
  osc.frequency.exponentialRampToValueAtTime(900, now+0.22);
  const g=sfxCtx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.15, now+0.025);
  g.gain.exponentialRampToValueAtTime(0.0001, now+0.25);
  osc.connect(g); g.connect(sfxNodes.sfxGain);
  osc.start(now); osc.stop(now+0.26);

  // ノイズによる短い「シュッ」という質感
  const src=sfxCtx.createBufferSource();
  src.buffer=noiseBuffer(0.22);
  const nf=sfxCtx.createBiquadFilter();
  nf.type='highpass';
  nf.frequency.setValueAtTime(6000, now);
  nf.frequency.exponentialRampToValueAtTime(1500, now+0.2);
  const ng=sfxCtx.createGain();
  ng.gain.setValueAtTime(0.0001, now);
  ng.gain.linearRampToValueAtTime(0.10, now+0.02);
  ng.gain.exponentialRampToValueAtTime(0.0001, now+0.22);
  src.connect(nf); nf.connect(ng); ng.connect(sfxNodes.sfxGain);
  src.start(now); src.stop(now+0.22);
}

// 中央キャラのダメージ(ジジ、というブザー/ノイズ音 ―― 低音・小音量)
function sfxDamage(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  const osc=sfxCtx.createOscillator();
  osc.type='square';
  osc.frequency.value=110;
  const g=sfxCtx.createGain();
  g.gain.setValueAtTime(0.10, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now+0.18);
  // 高速トレモロでブザー(ジジ)感を出す
  const buzz=sfxCtx.createOscillator();
  buzz.type='square'; buzz.frequency.value=42;
  const buzzGain=sfxCtx.createGain();
  buzzGain.gain.value=0.07;
  buzz.connect(buzzGain); buzzGain.connect(g.gain);
  osc.connect(g); g.connect(sfxNodes.sfxGain);
  osc.start(now); osc.stop(now+0.2);
  buzz.start(now); buzz.stop(now+0.2);
}

// 探索スロットへノード設定: 小さなクリック音
function sfxCommit(){
  if(!sfxGate()) return;
  const now=sfxCtx.currentTime;
  const osc=sfxCtx.createOscillator();
  osc.type='sine';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(440, now+0.1);
  const g=sfxCtx.createGain();
  g.gain.setValueAtTime(0.15, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now+0.12);
  osc.connect(g); g.connect(sfxNodes.sfxGain);
  osc.start(now); osc.stop(now+0.15);
}
