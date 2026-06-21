// information_breather v7_3 - サウンド (BGM制御 + Web Audio APIによるSE合成)
/* ===== 音声(SFX/BGM): 効果音・BGM制御の宣言 ===== */
let seOn=true, seVolume=0.7, seTypeCharOn=true;

/* ===== BGM楽曲定義 ===== */
// Base64音源は各トラックのaudioId要素として<audio>タグをindex.htmlに用意する
// unlockCondition: null=最初から解放, それ以外は解放条件の説明(表示用)
// unlockKey: s.unlockedTracks内で管理するキー(track_0は常時解放)
const TRACKS = [
  { id: 'track_0',  title: '♪ Dawn of Civilization',              audioId: 'bgmAudio_0',  unlockKey: null },
  { id: 'track_1',  title: '♪ Whispers of Questions',             audioId: 'bgmAudio_1',  unlockKey: null },
  { id: 'track_2',  title: '♪ The Information Sea',               audioId: 'bgmAudio_2',  unlockKey: null },
  { id: 'track_3',  title: '♪ Echoes of Meaning',                 audioId: 'bgmAudio_3',  unlockKey: null },
  { id: 'track_4',  title: '♪ Garden of Unfinished Worlds',       audioId: 'bgmAudio_4',  unlockKey: 'track_4' },
  { id: 'track_5',  title: '♪ Prison of Blind Faith',             audioId: 'bgmAudio_5',  unlockKey: 'track_5' },
  { id: 'track_6',  title: '♪ Beyond the Phase Wall',             audioId: 'bgmAudio_6',  unlockKey: 'track_6' },
  { id: 'track_7',  title: '♪ Language Horizon',                  audioId: 'bgmAudio_7',  unlockKey: 'track_7' },
  { id: 'track_8',  title: '♪ Entropy Cascade',                   audioId: 'bgmAudio_8',  unlockKey: 'track_8' },
  { id: 'track_9',  title: '♪ Silent Void',                       audioId: 'bgmAudio_9',  unlockKey: 'track_9' },
  { id: 'track_10', title: '♪ Fractal Cosmos',                    audioId: 'bgmAudio_10', unlockKey: 'track_10' },
  { id: 'track_11', title: '♪ Life Flux',                         audioId: 'bgmAudio_11', unlockKey: 'track_11' },
  { id: 'track_12', title: '♪ One Thought, Three Thousand Worlds', audioId: 'bgmAudio_12', unlockKey: 'track_12' },
  { id: 'track_13', title: '♪ Chain of Causality',                audioId: 'bgmAudio_13', unlockKey: 'track_13' },
  { id: 'track_14', title: '♪ Circle of End and Beginning',       audioId: 'bgmAudio_14', unlockKey: 'track_14' },
  { id: 'track_15', title: '♪ The Light That Walks the Middle Way', audioId: 'bgmAudio_15', unlockKey: 'track_15' },
];

let currentTrackIdx = 0;

/* ===== BGMプルダウン初期化 ===== */
function initBgmSelect(){
  const sel = document.getElementById('bgmTrackSelect');
  if(!sel) return;
  sel.innerHTML = '';
  TRACKS.forEach((t, i) => {
    const unlocked = true; // 解放条件は後で実装。現在は全曲表示
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

/* ===== SE: ファイル定義 ===== */
const SE_FILES = [
  'se/sfx_00.wav', // sfxDepart        出発
  'se/sfx_01.wav', // sfxDiscover      ノード発見
  'se/sfx_02.wav', // sfxWallBreak     位相の壁突破
  'se/sfx_03.wav', // sfxObstacle      障害発生
  'se/sfx_04.wav', // sfxRenormSuccess 再正規化成功
  'se/sfx_05.wav', // sfxRenormFail    再正規化失敗
  'se/sfx_06.wav', // sfxLevelUp       レベルアップ
  'se/sfx_07.wav', // sfxAbsorb        アイテム吸収
  'se/sfx_08.wav', // sfxItemDrop      アイテムドロップ
  'se/sfx_09.wav', // sfxItemLost      アイテム消失
  'se/sfx_10.wav', // sfxDamage        ダメージ
  'se/sfx_11.wav', // sfxCommit        スロットへノード設定
  'se/sfx_12.wav', // sfxTypeChar      タイプライター1文字
  'se/sfx_13.wav', // sfxWallAppear    位相の壁出現(ループ)
  'se/sfx_14.wav', // sfxAttackMiss    壁突破ミス
];

/* ===== SE: 初期化・ON/OFFトグル ===== */
function initSE(){
  // WAVファイル再生方式のため初期化処理は不要
}

function toggleSE(){
  const btn=document.getElementById('bgmToggle');
  seOn=!seOn;
  if(btn){
    btn.textContent='♪ SE: '+(seOn?'ON':'OFF');
    btn.classList.toggle('on', seOn);
  }
}

function toggleTypeCharSE(){
  const btn=document.getElementById('typecharSeToggle');
  seTypeCharOn=!seTypeCharOn;
  if(btn){
    btn.textContent='タイプ音: '+(seTypeCharOn?'ON':'OFF');
    btn.classList.toggle('on', seTypeCharOn);
  }
}

/* ===== SE: WAVファイル再生共通関数 ===== */
function playSE(idx){
  if(!seOn) return;
  const path=SE_FILES[idx];
  if(!path) return;
  const audio=new Audio(path);
  audio.volume=seVolume;
  audio.play().catch(err=>{ /* 再生失敗は無視 */ });
}

/* ===== SFX: 各イベントの効果音 ===== */
function sfxDepart()        { playSE(0); }   // 出発
function sfxDiscover()      { playSE(1); }   // ノード発見
function sfxWallBreak()     { playSE(2); }   // 位相の壁突破
function sfxObstacle()      { playSE(3); }   // 障害発生
function sfxRenormSuccess() { playSE(4); }   // 再正規化成功
function sfxRenormFail()    { playSE(5); }   // 再正規化失敗
function sfxLevelUp()       { playSE(6); }   // レベルアップ
function sfxAbsorb()        { playSE(7); }   // アイテム吸収
function sfxItemDrop()      { playSE(8); }   // アイテムドロップ
function sfxItemLost()      { playSE(9); }   // アイテム消失
function sfxDamage()        { playSE(10); }  // ダメージ
function sfxCommit()        { playSE(11); }  // スロットへノード設定
function sfxTypeChar()      { if(seTypeCharOn) playSE(12); } // タイプライター1文字
function sfxAttackMiss()    { playSE(14); }  // 壁突破ミス

// 位相の壁出現ループSE
let _wallLoopAudio = null;
function sfxWallAppear(){
  if(!seOn) return;
  if(_wallLoopAudio) return; // 既に再生中
  const audio = new Audio(SE_FILES[13]);
  audio.loop = true;
  audio.volume = seVolume;
  audio.play().catch(()=>{});
  _wallLoopAudio = audio;
}
function sfxWallStop(){
  if(!_wallLoopAudio) return;
  _wallLoopAudio.pause();
  _wallLoopAudio.currentTime = 0;
  _wallLoopAudio = null;
}
