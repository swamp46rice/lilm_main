// information_breather - デバッグ専用ファイル
// Steam販売時はindex.htmlからこのscriptタグを削除し、このファイルを同梱しない。

/* ===== デバッグ関数 ===== */
function debugUnlockAllTracks(){
  if(typeof s === 'undefined'){ log('DEBUG: s が未初期化です。'); return; }
  if(!s.unlockedTracks) s.unlockedTracks=[];
  TRACKS.forEach(t=>{ if(t.unlockKey && !s.unlockedTracks.includes(t.unlockKey)) s.unlockedTracks.push(t.unlockKey); });
  if(typeof updateBgmSelect==='function') updateBgmSelect();
  save();
  log('DEBUG: 全BGMトラックを解放しました。');
}
function debugPlayOpening(){
  if(typeof playOpening==='function') playOpening();
  else log('DEBUG: playOpening が見つかりません。');
}
function debugUnlockAll(){
  s.found=NODE_IDS.slice();
  if(s.txFlags){ s.txFlags.hitEntropy=true; s.txFlags.hitSilence=true; }
  if(typeof _prevFoundLen!=='undefined') _prevFoundLen=-1;
  checkAllTierCompleteAchievements();
  render();
  log('DEBUG: 全ノードを開放した('+NODE_IDS.length+'個)');
}
function debugWallCharge(){
  if(s.runStatus!=='観測中'){ log('DEBUG: 観測中のみ使用できます。'); return; }
  const frontier=s.wallsThisRun.length;
  if(frontier>=7){ log('DEBUG: すべての位相の壁を突破済みです。'); return; }
  if(s.wallActive){ log('DEBUG: 既に壁が出現中です。'); return; }
  const w=WALLS[frontier];
  const deadline=Math.round(10+10*(s.integrity/100));
  s.wallActive={frontier, remain:deadline, deadline};
  render();
  log('DEBUG: 壁'+(frontier+1)+'(「'+w.name+'」)を出現させました(残り'+deadline+'秒)。');
}
function debugWallBreak(){
  if(s.runStatus!=='観測中'){ log('DEBUG: 観測中のみ使用できます。'); return; }
  const frontier=s.wallsThisRun.length;
  if(frontier>=7){ log('DEBUG: すべての位相の壁を突破済みです。'); return; }
  const w=WALLS[frontier];
  s.wallsThisRun.push(w.name);
  s.lastEventText=w.text;
  log('DEBUG: '+w.text);
  if(frontier===6 && s.found.includes('kuukan')) s.metaUnlocks.infinity=true;
  grantPhaseAchievement(frontier);
  if(frontier===6) checkAttrLimitAchievement();
  s.wallActive=null;
  render(); save();
}
function debugForceReady(){
  if(s.runStatus!=='観測中'){ log('DEBUG: 観測中のみ使用できます。'); return; }
  _debugForceReady=true;
  log('DEBUG: 次のtickで壁を出現させます。');
}
function debugSetInfo(val){
  s.runInfo=val;
  render();
  log('DEBUG: runInfoを'+val+'に設定しました。');
}
function debugSetLevel(val){
  s.level=val;
  render();
  log('DEBUG: levelを'+val+'に設定しました。');
}

/* ===== Shift+D でデバッグメニュー開閉 ===== */
function initDebugMode(){
  let debugMode=false;

  function btnStyle(){
    return 'display:block;width:100%;margin:3px 0;padding:3px 8px;background:rgba(255,80,80,0.15);border:1px solid #f55;border-radius:3px;color:#f99;font-family:monospace;font-size:11px;cursor:pointer;text-align:left;';
  }

  const panel=document.createElement('div');
  panel.id='debugPanel';
  panel.style.cssText='display:none;position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.85);border:1px solid #f55;border-radius:6px;padding:10px 14px;z-index:500;font-family:monospace;font-size:11px;color:#f99;min-width:200px;max-height:580px;overflow-y:auto;';
  panel.innerHTML=`
    <div style="color:#f55;font-weight:bold;margin-bottom:8px;">⚠ DEBUG MODE</div>
    <button onclick="debugUnlockAll()" style="${btnStyle()}">全ノード開放</button>
    <button onclick="debugUnlockAllTracks()" style="${btnStyle()}">全BGM解放</button>
    <button onclick="debugWallCharge()" style="${btnStyle()}">壁を出現させる</button>
    <button onclick="debugWallBreak()" style="${btnStyle()}">壁を突破する</button>
    <button onclick="debugForceReady()" style="${btnStyle()}">次tick壁出現</button>
    <button onclick="debugSetInfo(100000)" style="${btnStyle()}">runInfo=10万</button>
    <button onclick="debugSetInfo(500000)" style="${btnStyle()}">runInfo=50万</button>
    <button onclick="debugSetInfo(9990000)" style="${btnStyle()}">runInfo=999万</button>
    <button onclick="debugSetLevel(50)" style="${btnStyle()}">level=50</button>
    <button onclick="debugSetLevel(100)" style="${btnStyle()}">level=100</button>
    <button onclick="debugPlayOpening()" style="${btnStyle()}">オープニングを見る</button>
    <button onclick="debugPlayEnding()" style="${btnStyle()}">エンディングを見る</button>
    <button onclick="playTrueEnding()" style="${btnStyle()}">真エンディングを見る</button>
  `;
  document.querySelector('.window').appendChild(panel);

  // Shift+D でトグル
  document.addEventListener('keydown', e=>{
    if(e.shiftKey && e.key==='D'){
      debugMode=!debugMode;
      panel.style.display=debugMode?'block':'none';
    }
  });

  // 画面切り替わり時に閉じる（titleScreen・gameScreenの表示変化を監視）
  const closePanel=()=>{ debugMode=false; panel.style.display='none'; };
  const targets=['titleScreen','openingOverlay','endingOverlay'];
  targets.forEach(id=>{
    const el=document.getElementById(id);
    if(el) new MutationObserver(()=>{ if(el.style.display!=='none') closePanel(); })
      .observe(el,{attributes:true,attributeFilter:['style']});
  });
  // グローバルに公開（startTick等から呼べるように）
  window._closeDebugPanel=closePanel;
}

// debug.jsが読み込まれた時点でinitTitleScreen()は完了しているため、即時実行
initDebugMode();

function debugPlayEnding(){
  if(typeof playEnding==='function') playEnding();
  else log('DEBUG: playEnding が見つかりません。');
}
