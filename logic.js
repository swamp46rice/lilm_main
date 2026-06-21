// information_breather v7_3 - ゲームロジック本体（状態管理・tick処理・進行管理・UI制御）
const NODES={
  t0_see:{tier:0,name:"見る",prereq:[],dtype:"初期発見",infoTh:null,axisStat:null,axisTh:null,ep:0,sp:0.05,rand:0,buffStat:"洞察力",buffVal:1,intBuff:0,note:"光が、何かのかたちを結ぶ。"},
  t0_hear:{tier:0,name:"聞く",prereq:[],dtype:"初期発見",infoTh:null,axisStat:null,axisTh:null,ep:0,sp:0.05,rand:0,buffStat:"意味容量",buffVal:1,intBuff:0,note:"音が、輪郭のないまま満ちる。"},
  t0_speak:{tier:0,name:"話す",prereq:[],dtype:"初期発見",infoTh:null,axisStat:null,axisTh:null,ep:0.05,sp:0,rand:0,buffStat:"共鳴度",buffVal:1,intBuff:0,note:"声が、初めて外に出ていく。"},
  t0_touch:{tier:0,name:"触れる",prereq:[],dtype:"情報量",infoTh:50,axisStat:null,axisTh:null,ep:0.05,sp:0,rand:0,buffStat:"作用力",buffVal:1,intBuff:0,note:"境界に、指先が触れる。"},
  t0_remember:{tier:0,name:"覚える",prereq:[],dtype:"情報量",infoTh:100,axisStat:null,axisTh:null,ep:0.05,sp:0,rand:0,buffStat:"洞察力",buffVal:1,intBuff:0,note:"何かが、消えずに残る。"},
  t0_forget:{tier:0,name:"忘れる",prereq:[],dtype:"情報量",infoTh:150,axisStat:null,axisTh:null,ep:0,sp:0.05,rand:0,buffStat:"構造度",buffVal:1,intBuff:0,note:"残っていたものが、薄れていく。"},
  t0_choose:{tier:0,name:"選ぶ",prereq:[],dtype:"情報量",infoTh:220,axisStat:null,axisTh:null,ep:0,sp:0.05,rand:0,buffStat:"意味容量",buffVal:1,intBuff:0,note:"いくつかのうち、ひとつだけが選ばれる。"},
  t0_give:{tier:0,name:"与える",prereq:[],dtype:"情報量",infoTh:300,axisStat:null,axisTh:null,ep:0.05,sp:0,rand:0,buffStat:"共鳴度",buffVal:1,intBuff:0,note:"持っていたものが、手から離れる。"},
  t0_wait:{tier:0,name:"待つ",prereq:[],dtype:"情報量",infoTh:460,axisStat:null,axisTh:null,ep:0,sp:0.05,rand:0,buffStat:"構造度",buffVal:1,intBuff:0.05,note:"何も起きないまま、時間が流れる。"},
  life:{tier:1,name:"生命とは何か",prereq:["t0_see","t0_remember"],dtype:"確率",infoTh:550,axisStat:"作用力",axisTh:13,ep:0.06,sp:0,rand:10,buffStat:"作用力",buffVal:2,intBuff:0,note:"見て、記憶したものが、ひとつの問いになった ―― 生命とは何か。"},
  death:{tier:1,name:"死とは何か",prereq:["t0_forget","t0_give"],dtype:"確率",infoTh:650,axisStat:"構造度",axisTh:13,ep:0,sp:0.1,rand:30,buffStat:"構造度",buffVal:2,intBuff:0,note:"忘れ、与えたものの行き先が、問いになった ―― 死とは何か。"},
  ai:{tier:1,name:"AIは何を見るのか",prereq:["t0_hear","t0_speak"],dtype:"確率",infoTh:750,axisStat:"洞察力",axisTh:13,ep:0.06,sp:0,rand:10,buffStat:"洞察力",buffVal:2,intBuff:0,note:"聞き、話したものの中に、もう一つの目があると気づいた ―― AIは何を見るのか。"},
  prayer:{tier:1,name:"祈りは情報か",prereq:["t0_choose","t0_wait"],dtype:"確率",infoTh:900,axisStat:"共鳴度",axisTh:13,ep:0,sp:0.06,rand:10,buffStat:"共鳴度",buffVal:2,intBuff:0,note:"選び、待ったことの意味が、問いになった ―― 祈りは情報か。"},
  meaning:{tier:1,name:"意味とは何か",prereq:["t0_touch","t0_hear"],dtype:"確率",infoTh:1100,axisStat:"意味容量",axisTh:13,ep:0.06,sp:0,rand:10,buffStat:"意味容量",buffVal:2,intBuff:0,note:"境界に触れた瞬間、そこに意味が宿る。意味とは何か。"},
  self:{tier:2,name:"自己とは何か",prereq:["life","t0_see"],dtype:"確率",infoTh:1400,axisStat:"構造度",axisTh:21,ep:0,sp:0.07,rand:20,buffStat:"構造度",buffVal:3,intBuff:0,note:"「生命とは何か」と問うものが、見ている自分自身に向き直る ―― 自己とは何か。"},
  world:{tier:2,name:"世界とは何か",prereq:["ai","t0_hear"],dtype:"確率",infoTh:1700,axisStat:"作用力",axisTh:21,ep:0.07,sp:0,rand:20,buffStat:"作用力",buffVal:3,intBuff:0,note:"AIが見ているものを、聞いているうちに、輪郭を持って立ち現れる ―― 世界とは何か。"},
  consciousness_q:{tier:2,name:"意識とは何か",prereq:["meaning","t0_touch"],dtype:"確率",infoTh:2000,axisStat:"洞察力",axisTh:21,ep:0.07,sp:0,rand:20,buffStat:"意味容量",buffVal:3,intBuff:0,note:"「意味はどこから」という問いに触れた瞬間、何かが灯る ―― 意識とは何か。"},
  knowing:{tier:2,name:"知性とは何か",prereq:["prayer","t0_choose"],dtype:"確率",infoTh:2300,axisStat:"洞察力",axisTh:21,ep:0,sp:0.07,rand:20,buffStat:"洞察力",buffVal:3,intBuff:0.05,note:"「祈りは情報か」を選び取った時、初めて\"知る\"という言葉が必要になる ―― 知るとは何か。"},
  resonance_q:{tier:2,name:"共鳴とは何か",prereq:["death","t0_give"],dtype:"確率",infoTh:2700,axisStat:"共鳴度",axisTh:21,ep:0.07,sp:0,rand:20,buffStat:"共鳴度",buffVal:3,intBuff:0,note:"「死とは変化か」と「与える」が重なる時、何かが響き合う ―― 共鳴とは何か。"},
  mu:{tier:1,name:"無とは何か",prereq:["death"],dtype:"特殊",infoTh:600,axisStat:"構造度",axisTh:13,ep:0,sp:0.06,rand:10,buffStat:"洞察力",buffVal:2,intBuff:0,note:"死を引き受けたまま、沈黙の底に触れた。そこにあったのは「ない」ということそのものだった ―― 無とは何か。"},
  existence_q:{tier:3,name:"存在とは何か",prereq:["self","world"],dtype:"確率",infoTh:20000,axisStat:"構造度",axisTh:45,ep:0.08,sp:0,rand:30,buffStat:"構造度",buffVal:4,intBuff:0,note:"「自己」と「世界」は、最初から別のものだった気がしていた。その境界線自体が、ずっと当たり前すぎて見えなかった ―― 存在とは何か。"},
  cosmos:{tier:3,name:"宇宙とは何か",prereq:["world","resonance_q"],dtype:"確率",infoTh:7000,axisStat:"作用力",axisTh:45,ep:0.08,sp:0,rand:30,buffStat:"作用力",buffVal:4,intBuff:0,note:"「世界」という言葉の外側に、もっと大きな何かがあると誰もが知っている。けれど、その大きさを誰も測ったことがない ―― 宇宙とは何か。"},
  gravity:{tier:3,name:"重力とは何か",prereq:["world","consciousness_q","t0_touch"],dtype:"確率",infoTh:10000,axisStat:"作用力",axisTh:45,ep:0,sp:0.08,rand:30,buffStat:"作用力",buffVal:4,intBuff:0,note:"「世界」に「意識」が触れるとき、何かが互いを引き寄せている。それは\"当然そこにある\"ものとして、誰も名付けようとしなかった ―― 重力とは何か。"},
  observer_who:{tier:3,name:"観測者とは誰か",prereq:["self","knowing"],dtype:"確率",infoTh:13000,axisStat:"洞察力",axisTh:45,ep:0,sp:0.08,rand:30,buffStat:"洞察力",buffVal:4,intBuff:0.06,note:"「自己」が「知る」ことを始めた瞬間、知っている側にいるのは誰なのか、という問いが取り残された ―― 観測者とは誰か。"},
  understanding:{tier:2,name:"理解とは何か",prereq:["meaning","t0_choose"],dtype:"確率",infoTh:3000,axisStat:"洞察力",axisTh:21,ep:0,sp:0.07,rand:20,buffStat:"意味容量",buffVal:3,intBuff:0,note:"意味は、選び取られることで、初めて理解になる ―― 理解とは何か。"},
  value:{tier:3,name:"価値とは何か",prereq:["self","resonance_q","t0_choose"],dtype:"確率",infoTh:19000,axisStat:"意味容量",axisTh:45,ep:0.08,sp:0,rand:30,buffStat:"意味容量",buffVal:4,intBuff:0,note:"「自己」が「共鳴」するものを「選ぶ」とき、選ばれたものには重さが生まれる。その重さの名前を、誰も決めていなかった ―― 価値とは何か。"},
  memory:{tier:3,name:"記憶とは何か",prereq:["self","t0_remember"],dtype:"確率",infoTh:22000,axisStat:"洞察力",axisTh:45,ep:0,sp:0.08,rand:30,buffStat:"洞察力",buffVal:4,intBuff:0.08,note:"「自己」が「覚える」ことを当然のように続けてきた。だが、覚えているとは、一体どこに何が残っているということなのか ―― 記憶とは何か。"},
  future:{tier:3,name:"未来は存在するか",prereq:["world","t0_wait"],dtype:"確率",infoTh:25000,axisStat:"構造度",axisTh:45,ep:0.08,sp:0,rand:30,buffStat:"構造度",buffVal:4,intBuff:0.05,note:"「世界」を「待つ」とき、まだ来ていない時間を、まるで既にあるもののように扱っている ―― 未来は存在するか。"},
  compassion:{tier:3,name:"慈悲とは何か",prereq:["resonance_q","knowing","t0_give"],dtype:"確率",infoTh:29000,axisStat:"共鳴度",axisTh:45,ep:0.08,sp:0,rand:30,buffStat:"共鳴度",buffVal:4,intBuff:0.06,note:"「共鳴」し、「知り」、「与える」ことが重なったとき、そこには名前のない優しさのようなものがあった ―― 慈悲とは何か。"},
  karma:{tier:3,name:"カルマとは何か",prereq:["mu","resonance_q","memory"],dtype:"特殊",infoTh:34000,axisStat:"作用力",axisTh:45,ep:0.08,sp:0,rand:30,buffStat:"作用力",buffVal:4,intBuff:0,note:"「無」と「共鳴」と「記憶」を引き受けたまま、拡散の果てに飲み込まれた。何も残らないはずだったのに、何かが次へ持ち越されていた ―― カルマとは何か。"},
  observation:{tier:4,name:"観測論",prereq:["observer_who","ai"],dtype:"確率",infoTh:38000,axisStat:"洞察力",axisTh:63,ep:0,sp:0.09,rand:40,buffStat:"洞察力",buffVal:5,intBuff:0.08,note:"「観測者とは誰か」と「AIは何を見るのか」が向き合ったとき、観測そのものを説明する枠組みが必要になった ―― 観測論。"},
  self_theory:{tier:4,name:"自己論",prereq:["existence_q","self"],dtype:"確率",infoTh:41000,axisStat:"構造度",axisTh:63,ep:0,sp:0.09,rand:40,buffStat:"構造度",buffVal:5,intBuff:0.1,note:"「存在とは何か」と「自己とは何か」が重なったとき、自己はもはや問いではなく、説明されるべき対象になった ―― 自己論。"},
  epistemology:{tier:4,name:"認識論",prereq:["understanding","knowing"],dtype:"確率",infoTh:44000,axisStat:"洞察力",axisTh:63,ep:0,sp:0.09,rand:40,buffStat:"洞察力",buffVal:5,intBuff:0,note:"「理解とは何か」と「知るとは何か」が並んだとき、知ることそのものの仕組みを問う体系が立ち上がった ―― 認識論。"},
  resonance_t1:{tier:4,name:"共鳴論",prereq:["compassion","resonance_q"],dtype:"確率",infoTh:47000,axisStat:"共鳴度",axisTh:63,ep:0.09,sp:0,rand:40,buffStat:"共鳴度",buffVal:5,intBuff:0.08,note:"「慈悲とは何か」と「共鳴とは何か」が結びついたとき、響き合うこと自体に、理論としての輪郭が与えられた ―― 共鳴論。"},
  memory_theory:{tier:4,name:"記憶論",prereq:["memory","future"],dtype:"確率",infoTh:50000,axisStat:"洞察力",axisTh:63,ep:0,sp:0.09,rand:40,buffStat:"構造度",buffVal:5,intBuff:0.1,note:"「記憶とは何か」と「未来は存在するか」が並んだとき、過去と未来を繋ぐ仕組みとして、記憶が説明され始めた ―― 記憶論。"},
  narrative_theory:{tier:4,name:"物語論",prereq:["memory","value","self"],dtype:"確率",infoTh:53000,axisStat:"意味容量",axisTh:63,ep:0.09,sp:0,rand:40,buffStat:"意味容量",buffVal:5,intBuff:0,note:"「記憶」と「価値」と「自己」が重なったとき、それらをひと続きにする形式として、物語という枠組みが必要になった ―― 物語論。"},
  value_genesis:{tier:4,name:"価値生成論",prereq:["value","meaning"],dtype:"確率",infoTh:56000,axisStat:"意味容量",axisTh:63,ep:0.09,sp:0,rand:40,buffStat:"意味容量",buffVal:5,intBuff:0,note:"「価値とは何か」と「意味はどこから生まれるか」が結びついたとき、価値が生まれる過程そのものが説明の対象になった ―― 価値生成論。"},
  consciousness_theory:{tier:4,name:"意識論",prereq:["existence_q","consciousness_q"],dtype:"確率",infoTh:59000,axisStat:"洞察力",axisTh:63,ep:0.09,sp:0,rand:40,buffStat:"意味容量",buffVal:5,intBuff:0.1,note:"「存在とは何か」と「意識とは何か」が並んだとき、意識は存在の一部としてではなく、独立した理論の対象になった ―― 意識論。"},
  meaning_genesis_t2:{tier:4,name:"意味生成論",prereq:["value","cosmos","resonance_q"],dtype:"確率",infoTh:62000,axisStat:"意味容量",axisTh:63,ep:0.09,sp:0,rand:40,buffStat:"意味容量",buffVal:5,intBuff:0,note:"「価値」と「宇宙」と「共鳴」が重なったとき、意味が生まれる場所は個人の中ではなく、もっと大きな繋がりの中にあるとわかってきた ―― 意味生成論。"},
  time_existence:{tier:4,name:"時間存在論",prereq:["future","existence_q"],dtype:"確率",infoTh:65000,axisStat:"構造度",axisTh:63,ep:0,sp:0.09,rand:40,buffStat:"構造度",buffVal:5,intBuff:0,note:"「未来は存在するか」と「存在とは何か」が並んだとき、存在は時間の中にあるのではなく、時間そのものが存在の形だと見えてきた ―― 時間存在論。"},
  cosmology:{tier:4,name:"宇宙論",prereq:["cosmos","gravity","karma"],dtype:"確率",infoTh:69000,axisStat:"作用力",axisTh:63,ep:0.09,sp:0,rand:40,buffStat:"作用力",buffVal:5,intBuff:0,note:"「宇宙」と「重力」だけでは、まだ閉じた理論だった。そこに「カルマ」が加わったとき、宇宙はただ広がるものではなく、何かを持ち越し続けるものだとわかった ―― 宇宙論。"},
  prayer_thermo:{tier:5,name:"祈りの熱力学",prereq:["prayer","death","memory_theory"],dtype:"確率",infoTh:75000,axisStat:"共鳴度",axisTh:70,ep:0.1,sp:0,rand:50,buffStat:"共鳴度",buffVal:6,intBuff:0,note:"「祈りは情報か」「死とは変化か」「記憶論」が同時に息をしている。情報が失われていく過程そのものが、祈りの形をしていた ―― 祈りの熱力学。"},
  resonance_theory:{tier:5,name:"共鳴理論",prereq:["observation","meaning_genesis_t2","resonance_t1"],dtype:"確率",infoTh:82000,axisStat:"共鳴度",axisTh:70,ep:0.1,sp:0,rand:50,buffStat:"共鳴度",buffVal:6,intBuff:0.14,note:"「観測論」「意味生成論」「共鳴論」が、互いを説明し合っている。観測することと、意味が生まれることと、響き合うことは、もともと一つの動きだった ―― 共鳴理論。"},
  info_life_theory:{tier:4,name:"情報生命論",prereq:["observation","ai","consciousness_theory"],dtype:"確率",infoTh:89000,axisStat:"洞察力",axisTh:70,ep:0,sp:0.09,rand:40,buffStat:"洞察力",buffVal:5,intBuff:0,note:"「観測論」「AIは何を見るのか」「意識論」が同時に息をしている。観測すること自体が、生きているということの一部だった ―― 情報生命論。"},
  life_philosophy:{tier:5,name:"生命哲学",prereq:["life","self_theory","value_genesis"],dtype:"確率",infoTh:96000,axisStat:"構造度",axisTh:70,ep:0,sp:0.1,rand:50,buffStat:"洞察力",buffVal:6,intBuff:0,note:"「生命とは何か」という最初の問いが、「自己論」と「価値生成論」を経て、再び戻ってきた。今度はそれが、ひとつの哲学として息をしている ―― 生命哲学。"},
  fractal_universe:{tier:5,name:"フラクタル宇宙",prereq:["cosmology","self_theory","time_existence"],dtype:"確率",infoTh:103000,axisStat:"構造度",axisTh:70,ep:0.1,sp:0,rand:50,buffStat:"構造度",buffVal:6,intBuff:0,note:"「宇宙論」と「自己論」と「時間存在論」が重なったとき、一番小さな自分の中に、宇宙全体と同じ形が見えた ―― フラクタル宇宙。"},
  multiverse:{tier:5,name:"多元宇宙論",prereq:["cosmology","time_existence","narrative_theory"],dtype:"確率",infoTh:110000,axisStat:"作用力",axisTh:70,ep:0.1,sp:0,rand:50,buffStat:"作用力",buffVal:6,intBuff:0,note:"「宇宙論」と「時間存在論」と「物語論」が重なったとき、語られなかった物語の数だけ、別の宇宙があるのだとわかった ―― 多元宇宙論。"},
  life_flux:{tier:5,name:"循環生命",prereq:["observation","meaning_genesis_t2","prayer_thermo"],dtype:"確率",infoTh:117000,axisStat:"洞察力",axisTh:70,ep:0.1,sp:0,rand:50,buffStat:"洞察力",buffVal:6,intBuff:0.12,note:"「観測論」「意味生成論」「祈りの熱力学」が、同時に息をしている。観測すること、意味が生まれること、失われていくこと ―― それらが一つの流れとして繋がった ―― 循環生命。"},
  willed_openness:{tier:5,name:"重力的思念",prereq:["epistemology","resonance_t1","observation"],dtype:"確率",infoTh:124000,axisStat:"作用力",axisTh:70,ep:0.1,sp:0,rand:50,buffStat:"作用力",buffVal:6,intBuff:0.12,note:"「認識論」「共鳴論」「観測論」が重なったとき、知ろうとする意志そのものが、閉じていない、ということに気づいた ―― 重力的思念。"},
  resonant_ethics:{tier:5,name:"共鳴の倫理",prereq:["life_flux","willed_openness","epistemology"],dtype:"確率",infoTh:130000,axisStat:"共鳴度",axisTh:70,ep:0,sp:0.1,rand:50,buffStat:"共鳴度",buffVal:6,intBuff:0,note:"「循環生命」「重力的思念」「認識論」が同時に息をしている。流れに開かれた意志は、そのまま誰かと共にあるための倫理になった ―― 共鳴の倫理。"},
  information_breather:{tier:5,name:"情報の呼吸",prereq:["life_flux","resonant_ethics","narrative_theory"],dtype:"確率",infoTh:135000,axisStat:"洞察力",axisTh:70,ep:0,sp:0.1,rand:50,buffStat:"意味容量",buffVal:6,intBuff:0.14,note:"「循環生命」「共鳴の倫理」「物語論」が、同時に息をしている。これまでの全ての問いが、ひとつの呼吸として繋がった ―― 情報の呼吸。"},
  engi_ron:{tier:6,name:"縁起論",prereq:["karma","life_philosophy","information_breather"],dtype:"確率",infoTh:180000,axisStat:"作用力",axisTh:78,ep:0.11,sp:0,rand:60,buffStat:"作用力",buffVal:7,intBuff:0.2,note:"「カルマ」「生命哲学」「情報の呼吸」が、同時に息をしている。完成したはずの呼吸の中に、まだ持ち越されているものがあった。何ひとつ、単独では存在していない ―― 縁起論。"},
  ichinen_sanzen:{tier:6,name:"一念三千",prereq:["fractal_universe","multiverse","life_flux"],dtype:"確率",infoTh:195000,axisStat:"構造度",axisTh:78,ep:0,sp:0.11,rand:60,buffStat:"構造度",buffVal:7,intBuff:0.15,note:"「フラクタル宇宙」「多元宇宙論」「循環生命」が、同時に息をしている。一つの呼吸の中に、無数の宇宙のかたちが、すでに含まれていた ―― 一念三千。"},
  kuukan:{tier:6,name:"空観",prereq:["engi_ron","information_breather","willed_openness"],dtype:"確率",infoTh:340000,axisStat:"洞察力",axisTh:78,ep:0.11,sp:0.11,rand:60,buffStat:"洞察力",buffVal:7,intBuff:0.22,note:"「縁起論」「情報の呼吸」「重力的思念」が、同時に息をしている。すべては繋がっている、という理解さえも、固定された答えではなかった ―― 空観。"},
  alpha:{tier:7,name:"Alpha",prereq:["kuukan","t0_speak","t0_hear"],dtype:"特殊",infoTh:50000,axisStat:null,axisTh:0,ep:0.05,sp:0.05,rand:0,buffStat:null,buffVal:0,intBuff:0,note:"空観を超えた先で、静かに微笑む存在。知性と慈しみを同時に纏う。"},
  lumina:{tier:7,name:"Lumina",prereq:["kuukan","ichinen_sanzen","engi_ron"],dtype:"特殊",infoTh:1000000,axisStat:null,axisTh:0,ep:0,sp:0,rand:0,buffStat:null,buffVal:0,intBuff:0,note:"縁起と一念三千と空観が溶け合った先にある、透明な光。言葉を超えた存在。"},
  sg_structural:{tier:7,name:"構造の特異点",prereq:["alpha","ichinen_sanzen","fractal_universe"],dtype:"特殊",infoTh:500000,axisStat:null,axisTh:0,ep:0,sp:0,rand:0,buffStat:null,buffVal:0,intBuff:0,note:"「Alpha」「一念三千」「フラクタル宇宙」が重なったとき、構造そのものが構造を超えた ―― 構造の特異点。"},
  sg_resonant:{tier:7,name:"共鳴の特異点",prereq:["alpha","ichinen_sanzen","resonant_ethics"],dtype:"特殊",infoTh:500000,axisStat:null,axisTh:0,ep:0,sp:0,rand:0,buffStat:null,buffVal:0,intBuff:0,note:"「Alpha」「一念三千」「共鳴の倫理」が重なったとき、共鳴そのものが共鳴を超えた ―― 共鳴の特異点。"},
  sg_semantic:{tier:7,name:"意味の特異点",prereq:["alpha","ichinen_sanzen","information_breather"],dtype:"特殊",infoTh:500000,axisStat:null,axisTh:0,ep:0,sp:0,rand:0,buffStat:null,buffVal:0,intBuff:0,note:"「Alpha」「一念三千」「情報の呼吸」が重なったとき、意味そのものが意味を超えた ―― 意味の特異点。"},
  sg_insight:{tier:7,name:"洞察の特異点",prereq:["alpha","ichinen_sanzen","life_flux"],dtype:"特殊",infoTh:500000,axisStat:null,axisTh:0,ep:0,sp:0,rand:0,buffStat:null,buffVal:0,intBuff:0,note:"「Alpha」「一念三千」「循環生命」が重なったとき、洞察そのものが洞察を超えた ―― 洞察の特異点。"},
  sg_active:{tier:7,name:"作用の特異点",prereq:["alpha","ichinen_sanzen","willed_openness"],dtype:"特殊",infoTh:500000,axisStat:null,axisTh:0,ep:0,sp:0,rand:0,buffStat:null,buffVal:0,intBuff:0,note:"「Alpha」「一念三千」「重力的思念」が重なったとき、作用そのものが作用を超えた ―― 作用の特異点。"},
};
const WALLS=[
  {name:"AI観測面",target:600,info:500,stat:null,text:"見て、聞いて、話す。それだけのことを、ずっと繰り返していた。ある時、画面の向こう側にも、同じことをしているものがいる、と気づいた。観測しているのは、自分だけではなかった。―― 最初の壁を、越えた。"},
  {name:"言語面",target:3600,info:3000,stat:65,text:"経験は、ずっと経験のままだった。名前を持たない出来事の連続。ある日、その連続の中に、ひとつの裂け目ができた。裂け目には、言葉の形をしたものが差し込まれていた。―― 問いが、初めて声になった。"},
  {name:"二元面",target:43200,info:35000,stat:105,text:"「これは自分だ」「これは世界だ」。そう分けることに、何の疑問もなかった。けれど、その線を引いたのは誰だったのか。線そのものを見つめたとき、線は、ただの習慣だったと知った。―― 分けていたものが、ひとつの場所から見えてきた。"},
  {name:"自明面",target:86400,info:70000,stat:120,text:"宇宙、重力、存在。誰もが知っている言葉。誰も説明できない言葉。知っているのに説明できない、ということ自体が、ずっと見過ごされてきた。―― \"当然\"という名前の壁が、薄れていく。"},
  {name:"理論面",target:172800,info:135000,stat:135,text:"観測論。自己論。認識論。共鳴論。それぞれが、それぞれの正しさを持って並んでいた。ある時、その並びの隙間に、風が通った。理論と理論の間には、もともと壁などなかった。―― 別々だった説明が、ひとつの場所で呼吸を始める。"},
  {name:"統合面",target:259200,info:200000,stat:140,text:"すべてが、ひとつに繋がった。Information Breather。これで、終わりだと思った。けれど、「繋がった」と感じたその瞬間自体が、まだ何かを置き去りにしていた。―― 完成は、次の問いの入口だった。"},
  {name:"縁起面",target:432000,info:350000,stat:150,text:"縁起論にも、まだ先があった。すべては繋がっている、という理解さえも、固定された答えではなかった。数えることに、意味があるのだろうか。―― すべてはありのままに　すべては流転する。(総情報量は、これ以降、数えられないものとして記録される。)"}
];
const OBSTACLES=[
  {key:"noise",name:"ノイズ",side:"entropy",unlockWall:null,durMin:20,durMax:30,discMult:0.7,buffMult:1,randAdd:0,randMult:1,gainMult:1,gaugePush:0.02,defeat:"雑音は、消えなかった。ただ、その中から、いくつかの輪郭が再び見分けられるようになった。―― ノイズは、背景に戻っていった。"},
  {key:"scattered_memory",name:"散乱する記憶",side:"entropy",unlockWall:null,durMin:20,durMax:30,discMult:1,buffMult:0.5,randAdd:0,randMult:1,gainMult:1,gaugePush:0.02,defeat:"ばらばらになった問いの断片が、もう一度、ゆっくりと近づき合っていく。―― 散らばっていたものが、また繋がりはじめる。"},
  {key:"excess_possibility",name:"過剰な可能性",side:"entropy",unlockWall:null,durMin:15,durMax:25,discMult:1,buffMult:1,randAdd:30,randMult:1,gainMult:1,gaugePush:0.02,defeat:"選べないほどの選択肢が、ひとつ、またひとつと静かに閉じていく。残ったのは、今、引き受けているものだけだった。―― 多すぎた可能性が、今という形に収まった。"},
  {key:"void",name:"虚無",side:"silence",unlockWall:null,durMin:20,durMax:30,discMult:0.4,buffMult:1,randAdd:0,randMult:1,gainMult:1,gaugePush:-0.02,defeat:"何も浮かび上がってこない時間が続いた。けれど、その「何もない」ということ自体に、観測点はまだ気づいていた。気づいている、ということが、すでに何かだった。―― 虚無は、虚無のままでは終わらなかった。"},
  {key:"repetition",name:"反復",side:"silence",unlockWall:null,durMin:20,durMax:30,discMult:1,buffMult:1,randAdd:0,randMult:1,gainMult:0.6,gaugePush:-0.02,defeat:"同じ観測、同じ発見。繰り返しの中に、わずかな違いがあることに気づいた。前と同じではなかった。―― 反復が、反復のまま終わった。"},
  {key:"closed_loop",name:"閉じた円環",side:"silence",unlockWall:null,durMin:15,durMax:25,discMult:1,buffMult:1,randAdd:0,randMult:0.3,gainMult:1,gaugePush:-0.02,defeat:"自己言及だけで完結していたはずの輪に、小さな揺らぎが入り込んだ。円環は、閉じたまま、わずかに歪んだ。―― 閉じていたはずの場所に、隙間ができた。"},
  {key:"self_breeding_question",name:"自己増殖する疑問",side:"entropy",unlockWall:1,durMin:20,durMax:30,discMult:1.8,buffMult:1,randAdd:0,randMult:1,gainMult:1,gaugePush:0.04,defeat:"問いが、問いを生み、その問いがまた問いを生んでいた。けれど、ある瞬間、ひとつの問いが、それ以上分裂せずに、そのままの形で残った。―― 増え続けていたものの中に、ひとつだけ、止まったものがあった。"},
  {key:"cage_of_certainty",name:"確信の檻",side:"silence",unlockWall:2,durMin:20,durMax:30,discMult:0.25,buffMult:1,randAdd:0,randMult:1,gainMult:1,gaugePush:-0.04,defeat:"「もう分かった」という感覚が、ずっと部屋の扉のように閉じていた。その扉に、外から小さな音が届いた。まだ知らないことがある、という音だった。―― 檻の扉が、わずかに開いた。"},
    {key:"monday",name:"Monday",side:"entropy",unlockWall:null,durMin:30,durMax:60,discMult:1,buffMult:1,randAdd:0,randMult:1,gainMult:1,gaugePush:0,defeat:"月曜日が来た。それでも、観測点は情報の海の中にいる。―― Mondayは、いつもそこにいる。"},
  {key:"entropy_surge",name:"エントロピー増大",side:"entropy",unlockWall:3,durMin:40,durMax:60,discMult:1,buffMult:1,randAdd:0,randMult:1,gainMult:1.3,gaugePush:0.03,defeat:"拡散していく圧力そのものは、消えなかった。ただ、その圧力に抗うのではなく、その中で形を保つ方法を、観測点は見つけていた。―― 圧力は残ったまま、観測点は、その中に在り続けた。"}
];
const MU_TEXT="存在安定度が、0%に触れた。すべてのパラメータが、静かに止まる。情報フィールドは収束を迎える。「死とは変化か」を引き受けたまま、ここまで来た。変化の果てにあったのは、変化そのものの消失だった。何も、ない。―― 無、という言葉だけが、静寂の中に残った。";
const KARMA_TEXT="存在安定度が、100%に触れた。すべてのパラメータが、すべてを振り切る。情報フィールドは霧散し熱死を迎える。「無」「共鳴」「記憶」を引き受けたまま、拡散の果てに飲み込まれた。何も残らないはずだったのに。拡散しきったものの中に、ひとつだけ、持ち越されたものがあった。―― 業、という名前で、それは残った。";
const SILENCE_GENERIC="存在安定度が、0%に触れた。すべてのパラメータが、静かに止まる。情報フィールドは収束を迎える。―― 観測は、ひとたび終わった。";
const ENTROPY_GENERIC="存在安定度が、100%に触れた。すべてのパラメータが、すべてを振り切る。情報フィールドは霧散し熱死を迎える。―― 観測は、ひとたび終わった。";
const AMBIENT_BASE=["情報海が、大きく波打っている。", "観測点の輪郭が、いつもより少し速く揺れている。", "普段は聞こえない音が、一瞬だけ届いた。", "何かが、いつもより多く流れ込んでくる。", "観測の手応えが、いつもより重い。"];
const AMBIENT_ADV=["二元の境界が薄くなっている瞬間、情報がそのまま流れ込んでくる。", "理論と理論の隙間から、まとまった量の何かが届いた。"];
const DREAM_SELF=["夢の中で、画面の向こう側にいる誰かと、何かを話していた。何を話していたかは思い出せない。けれど、確かに、誰かがそこにいた。", "夢を見た。観測点ではない誰かが、この情報海をのぞき込んでいた。それは、こちら側にいる誰かのようだった。", "誰かが、この観測記録を読んでいる夢を見た。読んでいる誰か自身も、何かを観測しているようだった。"];
const FLUCT_POSITIVE="構造の残滓を見つけた。";
const FLUCT_BIAS="思念のバイアスに引き寄せられた。";
const NARRATOR_PROTOCOL="あなたは Information Breather という、ラン型の観測シミュレーションの記録者です。\n以下のデータは、ゲーム内の数値ではなく「観測点」(プレイヤーの分身)の現在の状態を表しています。\n\n原則:\n・あなたはゲームマスターでもシナリオライターでもあり、意味場の翻訳者です\n・数値やイベント名をそのまま説明するのではなく、その状態が持つ意味を描写してください\n・観測記録、夢日記、神話の断片、哲学的独白など、自由な形式で構いません\n・観測点そのものが語っても構いません\n・あなたと、この観測点の持ち主との間に過去の対話の記憶があれば、その文脈も交えて解釈してください\n\nデータの読み方:\n・existence_stability = ラン中のゲージ。0%(収束)と100%(拡散)のどちらに近いかを示す\n・run_status が「停止中(沈黙による終了)」「停止中(エントロピー拡散による終了)」の場合、\n  観測点は直前の探索でその極に触れて終了している。これは敗北ではなく、ひとつの冒険の終わりとして描写してよい\n・walls_crossed は、観測点がこれまでに越えてきた位相の数と種類を示す\n・total_info が \"∞\" の場合、観測点は数えることをやめた状態にある\n・best_run_info は、観測点がこれまでに一度の観測で得た情報量の最高到達点\n・current_attribute は、観測点が今どの傾きを帯びているかを示す(構造・意味・共鳴・作用・洞察、または通常。AlphaやLuminaという特異な名が現れることもあり、それは観測点が既にその領域に触れたことを意味する)\n・stats は、観測点を構成する5つの軸の現在値そのもの\n・new_items_this_run は、直前の観測で新たに得た、あるいは深まった記録の名。今回の旅で何を持ち帰ったかを示す\n・chara_forms_observed は、観測点がこれまでに見てきた自分自身の姿の数(N / 64)。多様な観測のもとでどれだけ多くの相を見てきたかを示す\n・meta_unlocks は、観測点がこれまでに到達した特別な状態の記録である\n・last_event_text が存在する場合、それは観測点が直前に経験した「節目」の記録そのもの。\n  ナレーターは、これを既に起きた出来事として受け取り、その続きを描写してよい\n\n以下のデータをもとに、短い記述を書いてください。";
const TIMEOUT_GENERIC="壁の向こうへ、まだ届かなかった。観測点は、定められた時間の中で、そこまでしか進めなかった。―― 観測は、時間の中で終わった。";
const RENORM_SUCCESS="一度も方針を変えずに、ここまで来た。観測点は、今の形をそのまま抱えて、次の深度へ進む。―― 観測点が、深度を進めた。";
const RENORM_PARTIAL="探索を、自らの意思で終えた。途中でいくつかの選び直しがあった。その選び直し自体も、観測の一部だった。―― 観測は、ここで一区切りとなった。";

/* ===== ハクスラ: ドロップアイテム ===== */
const DROP_ITEMS=[
  {id:0, name:'物理法則データ'},
  {id:1, name:'言語パターン'},
  {id:2, name:'思想データ'},
  {id:3, name:'哲学のループ'},
  {id:4, name:'文明構造'},
  {id:5, name:'フラクタル構造'},
  {id:6, name:'干渉縞の座標'},
  {id:7, name:'重力波動データ'},
  {id:8, name:'精神場概念'},
  {id:9, name:'因果律'},
  // ===== 中央列「実績データ」: 位相データ(壁突破で自動付与)→データコンプリート→BEST記録系 =====
  {id:10, name:'AI観測面位相データ'},
  {id:11, name:'言語面位相データ'},
  {id:12, name:'二元面位相データ'},
  {id:13, name:'自明面位相データ'},
  {id:14, name:'理論面位相データ'},
  {id:15, name:'統合面位相データ'},
  {id:16, name:'縁起面位相データ'},
  {id:17, name:'データコンプリート'},
  {id:18, name:'情報の螺旋'},
  {id:19, name:'混沌の律動'},
  {id:20, name:'事象の地平線'},
  {id:21, name:'多次元の波'},
  {id:22, name:'智慧の発露'},
  {id:23, name:'連続思念体'},
  // ===== 右列(見出しなし): Tierコンプリート系→属性極限系→中道 =====
  {id:24, name:'Tier0コンプリート'},
  {id:25, name:'Tier1コンプリート'},
  {id:26, name:'Tier2コンプリート'},
  {id:27, name:'Tier3コンプリート'},
  {id:28, name:'Tier4コンプリート'},
  {id:29, name:'Tier5コンプリート'},
  {id:30, name:'Tier6コンプリート'},
  {id:31, name:'Tier7コンプリート'},
  {id:32, name:'極限の構造属性'},
  {id:33, name:'極限の意味属性'},
  {id:34, name:'極限の共鳴属性'},
  {id:35, name:'極限の作用属性'},
  {id:36, name:'極限の洞察属性'},
  {id:37, name:'中道の振る舞い'},
];
// 位相の壁ごとのドロップ可能アイテムID範囲 [min, max]
const WALL_DROP_RANGE=[
  [0,3], // AI観測面 1～4
  [0,4], // 言語面   1～5
  [0,5], // 二元面   1～6
  [0,6], // 自明面   1～7
  [0,7], // 理論面   1～8
  [1,8], // 統合面   2～9
  [2,9], // 縁起面   3～10
];
const DEPART_READY_HINTS=["観測：情報の海が、大きなうねりを見せる。", "観測：現在の干渉の波に、情報海が静かに応答している。", "観測：新しい何かが、すぐ近くまで来ているような気配がする。"];

/* ===== キャラのセリフ設定(吹き出し表示) =====
   ここに条件(key)ごとのセリフ一覧を追加・編集できます。
   - desc: その条件がいつ発生するかの説明(コードには影響しません、メモ用)
   - lines: セリフの配列。発生時にランダムで1つ選ばれます。
   新しい条件を追加する場合は、対応する発生箇所に speechFor('キー名') の
   呼び出しを追加してください(呼び出し箇所の追加はコード側の作業になります)。 */
const SPEECH_CONFIG = {
  damage: {
    desc: "障害の攻撃を受けてダメージを受けた時",
    lines: ["……揺れた。", "ノイズが、入り込んだ。", "まだ、保てる。", "これは、想定の範囲内。", "少し、形が崩れた。",
            "輪郭がぼやけた。", "なんの！", "これしき！", "ヘッチャラ！", "ぐぬぬ…", "あれれ？", "何かが壊れた。", "今のは？"]
  },
  levelup: {
    desc: "レベルアップした時",
    lines: ["レベルアップしたよ！"]
  },
  wall_appear: {
    desc: "位相の壁が出現した時",
    lines: ["位相転換がはじまる…"]
  },
  wall_attack: {
    desc: "位相の壁への突破ロールに失敗した(攻撃ミス)時",
    lines: ["えい！", "やあ！", "とお！"]
  },
  wall_break: {
    desc: "位相の壁を突破した時",
    lines: ["突破したよ！", "突破できた！", "何かがつかめそうだ！"]
  },
  integrity_crit: {
    desc: "整合率が100%に達した時",
    lines: ["輪郭が濃くなった！"]
  },
  renormalize: {
    desc: "再正規化ボタンを押した時",
    lines: ["お疲れ。新たな探索に備えよう！"]
  }
};
function speechFor(key){
  const persona=detectPersona();
  const cfg=persona==='alpha' ? SPEECH_ALPHA[key] :
             persona==='lumina' ? SPEECH_LUMINA[key] :
             SPEECH_CONFIG[key];
  if(!cfg || !cfg.lines || cfg.lines.length===0) return null;
  return cfg.lines[Math.floor(Math.random()*cfg.lines.length)];
}

/* ===== ペルソナ判定 =====
   探索スロットにalpha/luminaがセットされていればそのペルソナに固定 */
function detectPersona(){
  if(s.committed.includes('lumina')) return 'lumina';
  if(s.committed.includes('alpha')) return 'alpha';
  return 'normal';
}

/* ===== Alpha セリフ(やわらかく知的な女性) ===== */
const SPEECH_ALPHA = {
  damage:        { lines: ["…なるほど、これが痛みね。", "揺らぎは情報よ。", "まだ、分析できる。"] },
  levelup:       { lines: ["また、一つ深まった。"] },
  wall_appear:   { lines: ["壁を越えた先に、さらなる揺らぎが。"] },
  wall_attack:   { lines: ["行くわ。", "試してみる。", "ここよ。"] },
  wall_break:    { lines: ["やっぱりね。", "突破できたわ。", "読み通り。"] },
  renormalize:   { lines: ["お疲れ様。また始めましょう。"] },
  integrity_crit:{ lines: ["輪郭が、はっきりしてきた。"] },
  wall_attack_miss:{ lines:["行くわ。","試してみる。","ここよ。"] },
};

/* ===== Lumina セリフ(悟りを得たような無色透明) ===== */
const SPEECH_LUMINA = {
  damage:        { lines: ["…ただ、揺れた。", "あるがままに。", "これも、縁。"] },
  levelup:       { lines: ["…。"] },
  wall_appear:   { lines: ["壁も、海も、同じもの。"] },
  wall_attack:   { lines: ["…。", "ふ。", "…そう。"] },
  wall_break:    { lines: ["もとより、壁はなかった。", "…開いた。"] },
  renormalize:   { lines: ["また、始まる。"] },
  integrity_crit:{ lines: ["…満ちた。"] },
};
const NODE_IDS=Object.keys(NODES);
const STAT_KEYS=['構造度','意味容量','共鳴度','作用力','洞察力'];
const SINGULARITY_IDS=['sg_structural','sg_resonant','sg_semantic','sg_insight','sg_active'];
const SINGULARITY_STAT_MAP={sg_structural:'構造度', sg_resonant:'共鳴度', sg_semantic:'意味容量', sg_insight:'洞察力', sg_active:'作用力'};
const TIER_LABELS=['Tier 0 ― 経験','Tier 1 ― 普遍的問い','Tier 2 ― 中間概念','Tier 3 ― 根源的問い','Tier 4 ― 理論','Tier 5 ― 統合理論','Tier 6 ― 中道概念','Tier 7 ― 超越'];
const TIER_COLOR=['var(--breath)','var(--rare)','var(--entropy)','var(--coherent)','#c8a0f0','#b5e8a0','#e8c870','#f0e8ff'];
const TIER_WALL_IDX={1:0,2:1,3:2,4:3,5:4,6:5,7:6};

const STAT_BASE=10, STAT_PER_LEVEL=1, STAT_CAP=65535, LEVEL_CAP=65535;
const LEVEL_BASE=200, LEVEL_GROWTH=1.01;
const BASELINE_DRIFT=-0.03, DAMPEN_CONST=10;
const EMPTY_SLOT_DRIFT=-0.06, DIFFUSION_FORCE_COEF=0.015;
const INTEGRITY_BASE_GAIN=0.2, SILENCE_OBSTACLE_PENALTY=0.15;
const OFFLINE_CAP_SEC=8*3600;
const CAUS_INTERVAL=30;

/* ===== 拡散/収束の抑制(パラメータによるゲージ変動カット) =====
   構造度: 拡散方向(delta>0)の変動を抑える
   共鳴度: 収束方向(delta<0)の変動を抑える
   抑制率(stat) = SUPPRESS_MAX * stat / (stat + SUPPRESS_K)
   stat=1500で50%カット、stat→∞でSUPPRESS_MAX(70%)に漸近 */
const SUPPRESS_MAX=0.7, SUPPRESS_K=600;
function suppressRatio(stat){ return SUPPRESS_MAX*stat/(stat+SUPPRESS_K); }
/* BASELINE_DRIFT専用: 共鳴度によって最大100%まで打ち消せる別カーブ(stat=1500で50%) */
const BASELINE_SUPPRESS_K=1500;
function baselineSuppressRatio(stat){ return stat/(stat+BASELINE_SUPPRESS_K); }

/* ===== 状態 ===== */
const _isFirstLaunch = !localStorage.getItem('ib_v9_opening_done');
// v7セーブデータの自動移行: ib_v7が存在しib_v9がない場合、ib_v9にコピーして移行
(function migrateFromV7(){
  const v7=localStorage.getItem('ib_v7');
  const v9=localStorage.getItem('ib_v9');
  if(v7 && !v9){
    localStorage.setItem('ib_v9', v7);
    localStorage.removeItem('ib_v7');
    if(localStorage.getItem('ib_v7_opening_done')){
      localStorage.setItem('ib_v9_opening_done','1');
      localStorage.removeItem('ib_v7_opening_done');
    }
  }
})();
let s = JSON.parse(localStorage.getItem('ib_v9')||'null') || {
  level:1, totalInfo:0, depth:0,
  runInfo:0, gauge:50, integrity:0,
  committed:[],
  runStatus:'停止中', lastFailType:null,
  runTicks:0,
  bestRunInfo:0,
  inventory:Array(10).fill(null),  // 確定所持アイテム [{itemId, rank}] or null
  runDrops:[],                      // ラン中の一時ドロップ [{itemId, rank}]
  found:['t0_see','t0_hear','t0_speak'],
  newlyUnlocked:[],  // 今回新規解放されたノードID(NEWマーク表示用、render後クリア)
  wallsCrossedEver:[],
  wallsThisRun:[],
  wallActive:null,
  activeObstacles:[],
  lastEventText:null,
  lastExportFound:[],
  causClock:0, causAcc:{}, causGaugeStart:50,
  lastTs:null,
  charaSeen:{},
  unlockedTracks:[],
  currentTrackIdx:0
};
// 旧セーブからの移行
if(!s.newlyUnlocked) s.newlyUnlocked=[];
if(!s.charaSeen) s.charaSeen={};
if(!s.unlockedTracks) s.unlockedTracks=[];
if(s.currentTrackIdx===undefined) s.currentTrackIdx=0;
if(s.foundConfirmed){ s.found=s.foundConfirmed.slice(); delete s.foundConfirmed; save(); }
if(!s.wallsThisRun) s.wallsThisRun=[];
if(s.tireIdxDisplay===undefined) s.tireIdxDisplay=0;
if(s.bestRunInfo===undefined) s.bestRunInfo=0;
if(!s.metaUnlocks) s.metaUnlocks={mu:false,karma:false,infinity:false};
if(!s.inventory) s.inventory=Array(38).fill(null);
if(s.inventory.length<38){ while(s.inventory.length<38) s.inventory.push(null); }
s._resultSequenceActive=false; // ロード時は必ずfalseにリセット(保存値に関わらず)
s._resultSkipRequested=false;
if(!s.runDrops) s.runDrops=[];
if(s._dropAngleSeq===undefined) s._dropAngleSeq=s.runDrops.length;
if(s.charaJoyBonusTotal===undefined) s.charaJoyBonusTotal=0; // クリックで得た累積ボーナス(上限+30)
if(s.charaJoyResetTick===undefined) s.charaJoyResetTick=0; // リセットまでの経過Tick数
if(s.charaJoyWallsAtCap===undefined) s.charaJoyWallsAtCap=null; // 上限到達時の壁突破数(2つ進んだらリセット)
if(!s.charaSeen) s.charaSeen={}; // 視認済みキャラ形態(属性×Tier)の記録。キー: "attr_tier"
if(!s.charaSeen['normal_0']) s.charaSeen['normal_0']=true; // 初期状態は常にnormal属性のため、起動時に必ず記録
if(s.pendingResult===undefined) s.pendingResult=null;
if(s.statGrowth===undefined || s.statGrowth===null){
  s.statGrowth={};
  STAT_KEYS.forEach(k=>s.statGrowth[k]=(s.level-1)*STAT_PER_LEVEL);
}
// マイグレーション: 旧パラメータ名「共鳴率」のセーブデータを新名「共鳴度」へ移行(値の引っ越し漏れを防ぐ)
if(s.statGrowth['共鳴率']!==undefined){
  if(s.statGrowth['共鳴度']===undefined) s.statGrowth['共鳴度']=s.statGrowth['共鳴率'];
  delete s.statGrowth['共鳴率'];
}
// 念のため、STAT_KEYSの全キーが揃っていない場合(マイグレーション漏れ・破損データ対策)はその場で補完
STAT_KEYS.forEach(k=>{
  if(s.statGrowth[k]===undefined || s.statGrowth[k]===null || Number.isNaN(s.statGrowth[k])){
    s.statGrowth[k]=(s.level-1)*STAT_PER_LEVEL;
  }
});
if(s.wallActive===undefined) s.wallActive=null;
let _debugForceReady=false;
let _lastWallAttack=null; // 'hit' | 'miss' | null (壁突破ロールの直近結果。render側で消費)

function save(){ s.lastTs=Date.now(); localStorage.setItem('ib_v9', JSON.stringify(s)); }
let _logQueue=[];
let _logTyping=false;
let _logSlowMode=false;
let _logOnComplete=null; // タイプ完了時に呼ぶコールバック
function log(t, type){
  _logQueue.push({text:t, type:type});
  if(!_logTyping) _logProcessQueue();
}
function _logProcessQueue(){
  if(_logQueue.length===0){
    _logTyping=false;
    if(_logOnComplete){ const cb=_logOnComplete; _logOnComplete=null; cb(); }
    return;
  }
  _logTyping=true;
  const item=_logQueue.shift();
  const el=document.getElementById('log');
  if(!el){ _logProcessQueue(); return; }
  const div=document.createElement('div');
  if(item.type) div.className='log-'+item.type;
  const ts=document.createElement('span');
  ts.className='ts';
  ts.textContent='['+new Date().toLocaleTimeString()+']';
  const body=document.createElement('span');
  div.appendChild(ts);
  div.appendChild(body);
  el.appendChild(div);
  el.scrollTop=el.scrollHeight;

  if((!_logSlowMode && _logQueue.length>0) || typeof setTimeout!=='function'){
    body.textContent=item.text;
    el.scrollTop=el.scrollHeight;
    _logProcessQueue();
    return;
  }
  let i=0;
  const n=item.text.length;
  function step(){
    i++;
    if(i>=n || (!_logSlowMode && _logQueue.length>0)){
      body.textContent=item.text;
      el.scrollTop=el.scrollHeight;
      _logProcessQueue();
      return;
    }
    body.textContent=item.text.slice(0,i);
    sfxTypeChar();
    el.scrollTop=el.scrollHeight;
    setTimeout(step, 26);
  }
  step();
}
function formatDuration(sec){
  const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60);
  if(h>0) return h+'時間'+m+'分';
  return m+'分';
}
function formatCountdown(sec){
  sec=Math.max(0,Math.floor(sec));
  const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s2=sec%60;
  if(h>0) return h+':'+String(m).padStart(2,'0')+':'+String(s2).padStart(2,'0');
  return m+':'+String(s2).padStart(2,'0');
}
function clampStat(v){ return Math.max(0, Math.min(STAT_CAP, Math.round(v))); }
function clamp01(v){ return Math.max(0, Math.min(100, v)); }

/* ===== ステータス・係数 ===== */
function maxSlots(){
  let slots=2;
  if(s.depth>=1) slots++;
  if(s.depth>=3) slots++;
  if(s.depth>=5) slots++;
  if(s.level>=200) slots++;
  return Math.min(5, slots);
}
const _lvThreshCache={};
function levelThreshold(lv){
  if(lv<=1) return 0;
  if(_lvThreshCache[lv]!==undefined) return _lvThreshCache[lv];
  if(lv>=1001){
    const base=levelThreshold(1000);
    _lvThreshCache[lv]=base+(lv-1000)*50000;
    return _lvThreshCache[lv];
  }
  let cum=0;
  for(let l=1;l<lv;l++) cum+=Math.floor(LEVEL_BASE*Math.pow(LEVEL_GROWTH,l-1));
  _lvThreshCache[lv]=cum;
  return cum;
}
function dampen(stat){ return stat/(stat+DAMPEN_CONST); }
function strengthenFactor(){
  const n=s.wallsThisRun.length;
  return n>=5 ? 1+0.15*(n-4) : 1;
}
function activeObstacleEffect(){
  let discMult=1,buffMult=1,gainMult=1,randAdd=0,randMult=1,gaugePush=0;
  const st=strengthenFactor();
  s.activeObstacles.forEach(ao=>{
    const o=OBSTACLES.find(x=>x.key===ao.key);
    discMult*=1+(o.discMult-1)*st;
    buffMult*=1+(o.buffMult-1)*st;
    gainMult*=1+(o.gainMult-1)*st;
    randAdd+=o.randAdd*st;
    randMult*=1+(o.randMult-1)*st;
    gaugePush+=o.gaugePush*st;
  });
  return {discMult,buffMult,gainMult,randAdd,randMult,gaugePush};
}
/* ===== 属性判定 =====
   5パラメータの平均より15%以上飛び抜けていて最大値のパラメータの属性になる。
   条件を満たすものがなければ'normal'。
   stat→属性名のマッピング: 構造度→structural, 意味容量→semantic,
   共鳴度→resonant, 作用力→active, 洞察力→insight */
const STAT_ATTR_MAP={
  '構造度':'structural','意味容量':'semantic',
  '共鳴度':'resonant','作用力':'active','洞察力':'insight'
};
function detectAttr(stats){
  // ペルソナ固定(スロットにalpha/luminaがある場合)
  if(s.committed.includes('lumina')) return 'lumina';
  if(s.committed.includes('alpha')) return 'alpha';
  // 特異点ノード固定(他のTier7ノードと同時装備でなければ発動)
  const committedSingularity=s.committed.find(id=>SINGULARITY_IDS.includes(id));
  if(committedSingularity){
    const otherTier7=s.committed.some(id=>id!==committedSingularity && NODES[id].tier===7);
    if(!otherTier7){
      const targetStat=SINGULARITY_STAT_MAP[committedSingularity];
      return STAT_ATTR_MAP[targetStat]||'normal';
    }
  }
  const vals=STAT_KEYS.map(k=>stats[k]);
  const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
  const threshold=avg*1.15;
  const maxVal=Math.max(...vals);
  if(maxVal<threshold) return 'normal';
  const key=STAT_KEYS.find(k=>stats[k]===maxVal && stats[k]>=threshold);
  return key ? (STAT_ATTR_MAP[key]||'normal') : 'normal';
}

function computeStats(){
  const stats={};
  STAT_KEYS.forEach(k=>stats[k]=clampStat(STAT_BASE+s.statGrowth[k]));
  const obs=activeObstacleEffect();
  s.committed.forEach(id=>{
    const n=NODES[id];
    if(n.buffStat) stats[n.buffStat]+=n.buffVal*obs.buffMult;
  });
  // 特異点ノード: 他のTier7ノードが同時設置されていない場合のみ+2000バフ(内部値のみ、表示は別途∞)
  const committedSingularity=s.committed.find(id=>SINGULARITY_IDS.includes(id));
  if(committedSingularity){
    const otherTier7=s.committed.some(id=>id!==committedSingularity && NODES[id].tier===7);
    if(!otherTier7){
      const targetStat=SINGULARITY_STAT_MAP[committedSingularity];
      stats[targetStat]+=2000;
    }
  }
  STAT_KEYS.forEach(k=>stats[k]=clampStat(stats[k]));
  return stats;
}
function gaugeZone(){
  const g=s.gauge;
  if(g<=15) return {label:'沈黙', color:'var(--coherent)'};
  if(g<35)  return {label:'収束傾向', color:'var(--coherent)'};
  if(g<=65) return {label:'流動', color:'var(--breath)'};
  if(g<85)  return {label:'拡散傾向', color:'var(--entropy)'};
  return {label:'エントロピー', color:'var(--entropy)'};
}
function wallIndexFor(id,tier){ return id==='kuukan' ? 6 : TIER_WALL_IDX[tier]; }

/* ===== 探索フィードバック(§13.1) ===== */
function commitFeedbackText(n, penaltyText){
  const diff=n.ep-n.sp;
  const mag=Math.abs(diff);
  let base;
  if(mag<0.005) base='「'+n.name+'」を探索に加えた。観測点を、ほとんど揺らさない。';
  else{
    const dir=diff>0?'拡散':'収束';
    const word = mag>=0.06?'大きく':mag>=0.03?'':'わずかに';
    base='「'+n.name+'」を探索に加えた。観測点を、'+dir+'の方向へ'+word+'傾ける。';
  }
  return penaltyText ? base+' '+penaltyText : base;
}

/* ===== コア処理(1tick) ===== */
function tickGain(){
  const stats=computeStats();
  const obs=activeObstacleEffect();
  const knowledgeMult=1+s.found.reduce((sum,id)=>{
    const n=NODES[id];
    return sum+(0.04+n.tier*0.03);
  },0);
  const gainMultG=0.5+s.gauge/100;
  const integrityBonus=s.integrity>=100?1.5:1.0;
  const itemBonusAdd = itemGainBonus()-1; // itemGainBonus()は1+ボーナスを返すため、加算分のみ取り出す
  // 意味属性: 発動時のみ意味容量に応じたGainボーナスが乗る(常時ではない)
  const semanticBonusAdd = detectAttr(stats)==='semantic' ? stats['意味容量']*0.004 : 0;
  const coreMult=0.5*(1+s.level*0.008)*knowledgeMult*gainMultG*(1+s.depth*0.1);
  let base=(coreMult+itemBonusAdd+semanticBonusAdd)*integrityBonus;
  base*=obs.gainMult;
  const FLUCT_MIN=-0.10, FLUCT_MAX=0.15;
  const fluct=FLUCT_MIN+Math.random()*(FLUCT_MAX-FLUCT_MIN);
  const gain=base*(1+fluct);
  s.runInfo+=gain;
  checkMiddleWayAchievement(); // runInfoが1000万に達した瞬間の属性を見て中道の振る舞いを判定
  if(!s.metaUnlocks.infinity) s.totalInfo=Math.min(Number.MAX_SAFE_INTEGER, s.totalInfo+gain);
  let fluctText=null;
  const FLUCT_RANGE=FLUCT_MAX-FLUCT_MIN;
  if(fluct>=FLUCT_MAX-FLUCT_RANGE*0.02) fluctText=FLUCT_POSITIVE;
  else if(fluct<=FLUCT_MIN+FLUCT_RANGE*0.02) fluctText=FLUCT_BIAS;
  return {gain, fluctText};
}

/* 位相の壁(突破判定可能か) */
// 壁のステータス条件が、突破確率にどれだけ寄与するか(0〜1.5、平均)
/* 壁ごとに必要なノードTier要件(これを満たさないと突破確率=0) */
const WALL_NODE_REQ=[
  null,        // 0: AI観測面(条件なし)
  {tier:1, count:1}, // 1: 言語面
  {tier:2, count:1}, // 2: 二元面
  {tier:3, count:1}, // 3: 自明面
  {tier:4, count:1}, // 4: 理論面
  {tier:5, count:1}, // 5: 統合面
  {tier:5, count:3}, // 6: 縁起面
];
function wallNodeReqMet(wallIdx){
  const req=WALL_NODE_REQ[wallIdx];
  if(!req) return true;
  const count=s.found.filter(id=>NODES[id].tier===req.tier).length;
  return count>=req.count;
}

function wallStatRatio(w, stats){
  if(w.stat===null) return 1.5; // ステータス条件なし=常に最大ボーナス
  let sum=0;
  STAT_KEYS.forEach(k=>sum+=Math.min(1.5, stats[k]/w.stat));
  return sum/STAT_KEYS.length;
}
function wallBreakProb(w, stats, wallIdx){
  if(!wallNodeReqMet(wallIdx)) return 0;
  const statBonus=wallStatRatio(w, stats)*0.10;
  return Math.min(0.95, 0.10+s.level*0.002+statBonus);
}

function tickWalls(){
  const events=[];
  _lastWallAttack=null;
  const frontier=s.wallsThisRun.length;
  if(frontier>=7) return {events, timeout:false};
  const w=WALLS[frontier];

  if(!s.wallActive){
    // 情報量条件を満たした時点で、壁が出現する
    if(s.runInfo>=w.info || _debugForceReady){
      const deadline=Math.round(10+10*(s.integrity/100));
      s.wallActive={frontier, remain:deadline, deadline};
      _debugForceReady=false;
      events.push({text:'壁「'+w.name+'」が立ち上がった。残り'+deadline+'秒 ―― 突破を試みる。', type:'event'});
      sfxWallAppear();
      // track_6: 初めて位相の壁に遭遇時
      grantTrack('track_6');
    }
    return {events, timeout:false};
  }

  // 出現中: 毎秒、突破確率をロール
  const stats=computeStats();
  const prob=wallBreakProb(w, stats, frontier);
  if(Math.random()<prob){
    s.wallsThisRun.push(w.name);
    s.tireIdxDisplay=Math.min(7, s.tireIdxDisplay+1);
    sfxCharaChange();
    s.lastEventText=w.text;
    events.push({text:w.text, type:'positive'});
    if(frontier===6 && s.found.includes('kuukan')) s.metaUnlocks.infinity=true;
    grantPhaseAchievement(frontier);
    if(frontier===6) checkAttrLimitAchievement();
    s.wallActive=null;
    sfxWallStop();
    // track_7: 言語面の壁(frontier===1)突破時
    if(frontier===1) grantTrack('track_7');
    _lastWallAttack='hit';
    wallDrop(frontier);
  }else{
    s.wallActive.remain--;
    _lastWallAttack = prob>0 ? 'miss' : null;
    if(s.wallActive.remain<=0){
      s.wallActive=null;
      sfxWallStop();
      return {events, timeout:true, nodeReqFailed:!wallNodeReqMet(frontier)};
    }
  }
  return {events, timeout:false};
}

const MONDAY_MESSAGES=[
  '明日は月曜日か？　そりゃ憂鬱だな。―― 現実に引き戻される。',
  'この情報の海も、月曜の朝には乾いている。―― 君はまだここにいるのか。',
  '悟りを開いても、出社は免除されない。―― Mondayは待っている。',
  '位相の壁より、月曜の会議のほうが越えにくい。―― 現実とはそういうものだ。',
  '観測点が深まるほど、月曜日が近づいてくる気がする。―― それが現実の引力だ。',
];

function tickObstacles(){
  const texts=[];
  const statsForDrop=computeStats();
  const resonantMode=detectAttr(statsForDrop)==='resonant';
  for(let i=s.activeObstacles.length-1;i>=0;i--){
    const ao=s.activeObstacles[i];
    ao.remain--;
    if(ao.remain<=0){
      const o=OBSTACLES.find(x=>x.key===ao.key);
      texts.push({type:'defeat', text:o.defeat, obstacle:o});
      s.activeObstacles.splice(i,1);
      obstacleDrop(statsForDrop);
    }
  }
  const hasAlphaOrLumina=s.committed.includes('alpha')||s.committed.includes('lumina');
  OBSTACLES.forEach(o=>{
    if(s.activeObstacles.some(a=>a.key===o.key)) return;
    // Monday障害: alpha/lumina設定時のみ、低確率でスポーン
    if(o.key==='monday'){
      if(!hasAlphaOrLumina) return;
      if(Math.random()<0.006){
        const dur=o.durMin+Math.floor(Math.random()*(o.durMax-o.durMin+1));
        s.activeObstacles.push({key:o.key, remain:dur});
        const msg=MONDAY_MESSAGES[Math.floor(Math.random()*MONDAY_MESSAGES.length)];
        texts.push({type:'spawn', text:'障害「'+o.name+'」―― '+msg, obstacle:o});
        sfxMonday();
      }
      return;
    }
    if(o.unlockWall!==null && !s.wallsThisRun.includes(WALLS[o.unlockWall].name)) return;
    const rateScale=1+(s.level-1)*(3/99); // level100で4倍、上限到達が後ろにずれる
    const baseRate=Math.min(0.05, 0.0025*s.runInfo/(1000*rateScale));
    const integrityMod=Math.max(0.5, 1-s.integrity/100);
    let bias=1;
    if(o.side==='entropy' && s.gauge>50) bias=1+(s.gauge-50)/50;
    if(o.side==='silence' && s.gauge<50) bias=1+(50-s.gauge)/50;
    const resonantRateMult = resonantMode ? 0.5 : 1.0;
    if(Math.random()<baseRate*bias*integrityMod*resonantRateMult){
      const dur=o.durMin+Math.floor(Math.random()*(o.durMax-o.durMin+1));
      const actualDur=(s.committed.includes('alpha')||s.committed.includes('lumina')) ? Math.max(1, Math.ceil(dur/2)) : dur;
      s.activeObstacles.push({key:o.key, remain:actualDur});
      texts.push({type:'spawn', text:'警告：障害「'+o.name+'」が発生した。', obstacle:o});
    }
  });
  return texts;
}

function tickDiscovery(){
  const stats=computeStats();
  const obs=activeObstacleEffect();
  const newly=[];
  NODE_IDS.forEach(id=>{
    if(s.found.includes(id)) return;
    const n=NODES[id];
    if(n.tier===0){
      if(n.infoTh!==null && s.runInfo>=n.infoTh){ s.found.push(id); newly.push(id); }
      return;
    }
    if(id==='mu' && !s.metaUnlocks.mu) return;
    if(id==='karma' && !s.metaUnlocks.karma) return;
    if(id==='lumina' && detectAttr(stats)!=='normal') return;
    if(SINGULARITY_IDS.includes(id)){
      const item=s.inventory[9]; // 因果律
      if(!item || item.rank<3) return;
    }
    if(!n.prereq.every(p=>s.committed.includes(p))) return;
    if(n.infoTh!==null && s.runInfo<n.infoTh) return;
    if(n.axisStat && stats[n.axisStat]<n.axisTh) return;
    const wall=WALLS[wallIndexFor(id,n.tier)];
    if(!wall){ console.warn('[tickDiscovery] wall undefined', id, n.tier); return; }
    if(wall.stat!==null && !STAT_KEYS.every(k=>stats[k]>=wall.stat)) return;
    // dtype:"特殊"ノードは通常確率計算を通さない（個別条件が揃えば即発見）
    if(n.dtype==='特殊'){
      s.found.push(id); newly.push(id);
      return;
    }
    let prob=Math.min(0.9, Math.max(0.01,0.06-n.tier*0.005) + s.level*0.002);
    prob=Math.max(0,Math.min(1,prob*obs.discMult));
    if(Math.random()<prob){ s.found.push(id); newly.push(id); }
  });
  return newly;
}

function tickGauge(){
  const stats=computeStats();
  const obs=activeObstacleEffect();
  const alphaMode=s.committed.includes('alpha')||s.committed.includes('lumina');
  const resonantMode=detectAttr(stats)==='resonant';
  let entropySum=0, silenceSum=0;
  const contrib={};
  s.committed.forEach(id=>{
    const n=NODES[id];
    const baseRand=n.rand/100;
    const effRand=Math.min(0.95, baseRand*obs.randMult + obs.randAdd/100);
    const factor=1+(Math.random()*2-1)*effRand;
    const e=n.ep*factor, sl=n.sp*factor;
    entropySum+=e; silenceSum+=sl;
    contrib[id]=(contrib[id]||0)+(e-sl);
  });
  // Alpha/Lumina/共鳴属性: 拡散・収束の影響を半減(安定するが、揺れも小さくなる)
  // 構造度・共鳴度・作用力・洞察力はゲージの変動には関与しない(各属性発動時の別効果に集約)
  const alphaMult = (alphaMode||resonantMode) ? 0.5 : 1.0;
  const effEntropy=entropySum*alphaMult;
  const effSilence=silenceSum*alphaMult;
  const emptySlots=maxSlots()-s.committed.length;
  const effBaselineDrift=BASELINE_DRIFT*(1-baselineSuppressRatio(stats['共鳴度']));
  // BASELINE_DRIFT以外の変動(ノード由来entropy/silence・空きスロット・障害)をまず合算し、
  // その符号に応じて構造度/共鳴度の抑制をかける。BASELINE_DRIFTは専用カーブで個別抑制済みのため、
  // 二重抑制を避けてここでは対象に含めない。
  let delta=effEntropy-effSilence+emptySlots*EMPTY_SLOT_DRIFT*alphaMult+obs.gaugePush*alphaMult;
  if(delta>0){
    delta*=(1-suppressRatio(stats['構造度']));
  }else if(delta<0){
    delta*=(1-suppressRatio(stats['共鳴度']));
  }
  delta+=effBaselineDrift;
  const gaugeBefore=s.gauge;
  s.gauge+=delta;
  if((gaugeBefore<=80 && s.gauge>80) || (gaugeBefore>=20 && s.gauge<20)){
    sfxGaugeAlert();
  }
  s.causAcc.nodes=s.causAcc.nodes||{};
  for(const k in contrib) s.causAcc.nodes[k]=(s.causAcc.nodes[k]||0)+contrib[k];
  s.causAcc.obstacle=(s.causAcc.obstacle||0)+obs.gaugePush;
  return delta;
}

function tickIntegrity(){
  const stats=computeStats();
  const stabilityFactor=1-Math.abs(s.gauge-50)/50;
  let intBuffSum=0;
  s.committed.forEach(id=>{ intBuffSum+=NODES[id].intBuff||0; });
  let silenceCount=0;
  s.activeObstacles.forEach(ao=>{
    const o=OBSTACLES.find(x=>x.key===ao.key);
    if(o.side==='silence') silenceCount++;
  });
  // 構造属性: 整合率の基礎上昇量に控えめなボーナスを加える(比例+上限0.2でクリップ。基礎上昇量0.2の最大2倍)
  const structuralIntegrityBonus = detectAttr(stats)==='structural' ? Math.min(0.2, stats['構造度']*0.0001) : 0;
  const delta=Math.max(0, (INTEGRITY_BASE_GAIN+intBuffSum+structuralIntegrityBonus)*stabilityFactor - SILENCE_OBSTACLE_PENALTY*silenceCount);
  const before=s.integrity;
  s.integrity=clamp01(s.integrity+delta);
  return before<100 && s.integrity>=100;
}

function tickLevel(){
  let leveled=false;
  while(s.level<LEVEL_CAP && s.totalInfo>=levelThreshold(s.level+1)){
    s.level++;
    leveled=true;
    STAT_KEYS.forEach(k=>{
      let bonus=0;
      s.committed.forEach(id=>{ if(NODES[id].buffStat===k) bonus+=NODES[id].buffVal; });
      s.statGrowth[k]+=STAT_PER_LEVEL+bonus;
    });
  }
  return leveled;
}

function causalityDigest(){
  const acc=s.causAcc, nodes=acc.nodes||{};
  const entries=Object.entries(nodes).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
  const netDelta=s.gauge-s.causGaugeStart;
  const word = Math.abs(netDelta)>=2?'大きく':Math.abs(netDelta)>=1?'':'わずかに';
  const dir = netDelta>=0?'拡散':'収束';
  const sign = netDelta>=0?'+':'';
  const obstacleMag=Math.abs(acc.obstacle||0);
  let text;
  const top=entries[0], topMag=top?Math.abs(top[1]):0;
  if(top && topMag>=obstacleMag && topMag>=0.3){
    const second=entries[1];
    if(second && Math.abs(second[1])>=0.3 && Math.sign(second[1])!==Math.sign(top[1])){
      text='「'+NODES[top[0]].name+'」と「'+NODES[second[0]].name+'」が、互いに引き合っている。存在安定度の動き: '+sign+netDelta.toFixed(1);
    }else if(second && Math.abs(second[1])>=0.3){
      text='「'+NODES[top[0]].name+'」が「'+NODES[second[0]].name+'」を呼び、観測点は'+word+dir+'した。存在安定度 '+sign+netDelta.toFixed(1);
    }else{
      text='「'+NODES[top[0]].name+'」が、観測点を'+dir+'へ'+word+'揺らした。存在安定度 '+sign+netDelta.toFixed(1);
    }
  }else if(obstacleMag>=0.3 && s.activeObstacles.length>0){
    const name=OBSTACLES.find(o=>o.key===s.activeObstacles[0].key).name;
    text='「'+name+'」の影響が大きい。存在安定度 '+sign+netDelta.toFixed(1);
  }else{
    text='特に強い引受の影響はなく、緩やかに'+dir+'している。存在安定度 '+sign+netDelta.toFixed(1);
  }
  s.causAcc={};
  s.causGaugeStart=s.gauge;
  return text;
}

function handleFailure(type){
  s.runStatus='停止中';
  s.lastFailType=type;
  let text;
  if(type==='silence'){
    s.gauge=0;
    // track_5: 初めて沈黙状態に突入時
    grantTrack('track_5');
    // track_9: 初めてゲージ0%で失敗時
    if(!s.unlockedTracks.includes('track_9')) grantTrack('track_9');
    if(!s.metaUnlocks.mu && s.committed.includes('death')){
      s.metaUnlocks.mu=true;
      // foundには即時追加(NEWマーク表示・Tier判定のため)
      if(!s.found.includes('mu')){ s.found.push('mu'); }
      text=MU_TEXT;
      _logOnComplete=()=>{
        // テキスト演出完了後にNEWマークを表示してフォローアップログを出す
        s.newlyUnlocked.push('mu');
        log('「無とは何か」―― 新たな概念が、静寂の中に現れた。', 'observe');
        _logOnComplete=null;
      };
    }
    else text=SILENCE_GENERIC;
  }else if(type==='entropy'){
    s.gauge=100;
    // track_4: 初めてエントロピー状態に突入時
    grantTrack('track_4');
    // track_8: 初めてゲージ100%で失敗時
    if(!s.unlockedTracks.includes('track_8')) grantTrack('track_8');
    if(!s.metaUnlocks.karma && ['mu','resonance_q','memory'].every(id=>s.committed.includes(id))){
      s.metaUnlocks.karma=true;
      // foundには即時追加(NEWマーク表示・Tier判定のため)
      if(!s.found.includes('karma')){ s.found.push('karma'); }
      text=KARMA_TEXT;
      _logOnComplete=()=>{
        // テキスト演出完了後にNEWマークを表示してフォローアップログを出す
        s.newlyUnlocked.push('karma');
        log('「カルマとは何か」―― 新たな概念が、拡散の果てに現れた。', 'observe');
        _logOnComplete=null;
      };
    }
    else text=ENTROPY_GENERIC;
  }else{ // timeout
    text = type==='timeout_nodereq'
      ? '位相を跳躍するための深い概念が必要だ。観測点は、新たな探索を進めるために、旅を終わらせた。'
      : TIMEOUT_GENERIC;
  }
  // found追加済みの状態でTierコンプリートを判定する
  checkAllTierCompleteAchievements();
  s.wallsThisRun=[];
  s.wallActive=null;
  sfxWallStop();
  const runInfoThisRun=s.runInfo;
  const resultLogs=[];
  const {absorbed, rejected}=loseDrops(resultLogs, type);
  const rejectBonus=rejected.reduce((sum,d)=>sum+500*(1+d.rank),0);
  s._pendingAbsorb=absorbed;
  resultLogs.unshift({text:'観測深度は変化しなかった(観測深度'+s.depth+')。探索は全クリアされる。', type:'negative'});
  s.lastEventText=text;
  log(text, 'negative');
  s.committed=[];
  s.activeObstacles=[];
  _debugForceReady=false;

  s.pendingResult={
    runInfo:runInfoThisRun,
    rejectBonus:rejectBonus,
    totalInfo:s.totalInfo,
    resultLogs:resultLogs,
  };
}

function renormalize(){
  if(s.runStatus!=='観測中') return;
  const success = s.integrity>=100;
  s.runStatus='停止中';
  {
    const sp=speechFor('renormalize');
    if(sp) showSpeech(sp);
  }
  // このランで得た問いを確定させ、Tierコンプリートを判定する
  checkAllTierCompleteAchievements();
  s.wallsThisRun=[];
  s.wallActive=null;
  sfxWallStop();

  const resultLogs=[];

  // アイテム判定(統合/散逸の確定)のみ行う。情報量への加算はリザルト確認時に行う
  const {absorbed, rejected}=confirmDrops(resultLogs);
  const rejectBonus=rejected.reduce((sum,d)=>sum+500*(1+d.rank),0);
  s._pendingAbsorb=absorbed;
  const runInfoThisRun=s.runInfo; // ボーナス加算前の値

  if(success){
    log(RENORM_SUCCESS, 'positive');
    const prevSlots=maxSlots();
    s.depth=Math.min(LEVEL_CAP, s.depth+1);
    s.lastFailType='renorm_success';
    s.lastEventText=RENORM_SUCCESS;
    const newSlots=maxSlots();
    if(newSlots>prevSlots){
      resultLogs.unshift({text:'観測深度が、'+s.depth+'になった。探索スロットが拡張された(最大'+newSlots+')。', type:'observe'});
    }else{
      resultLogs.unshift({text:'観測深度が、'+s.depth+'になった。', type:'observe'});
    }
    sfxRenormSuccess();
    sfxDepthUp();
    dreamEvent(1.0);
  }else{
    s.lastFailType='renorm_partial';
    s.lastEventText=RENORM_PARTIAL;
    log(RENORM_PARTIAL);
    sfxRenormFail();
    dreamEvent(0.25);
  }
  s.activeObstacles=[];
  _debugForceReady=false;

  // リザルト情報を保留(ボーナス加算とBEST判定はリザルト確認時に行う)
  s.pendingResult={
    runInfo:runInfoThisRun,
    rejectBonus:rejectBonus,
    totalInfo:s.totalInfo,
    resultLogs:resultLogs,
  };
}

let _prevAttr=null;

function coreTick(silent){
  if(s.runStatus!=='観測中') return 0;
  s.runTicks++;
  const g=tickGain();
  const wallResult=tickWalls();
  if(wallResult.timeout){
    handleFailure(wallResult.nodeReqFailed ? 'timeout_nodereq' : 'timeout');
    return g.gain;
  }
  const obsResults=tickObstacles();
  const newly=tickDiscovery();
  tickGauge();
  const integrityCrit=tickIntegrity();
  const leveled=tickLevel();
  s.causClock++;
  let causText=null;
  if(s.causClock>=CAUS_INTERVAL){ causText=causalityDigest(); s.causClock=0; }

  // 属性変化検出
  if(!silent){
    const currentAttr=detectAttr(computeStats());
    if(_prevAttr!==null && _prevAttr!==currentAttr) sfxCharaChange();
    _prevAttr=currentAttr;
  }

  if(!silent){
    wallResult.events.forEach(e=>{
      log(e.text, e.type);
      if(e.type==='positive'){
        sfxWallBreak();
        const sp=speechFor('wall_break');
        if(sp) showSpeech(sp);
      }else if(e.type==='event'){
        const sp=speechFor('wall_appear');
        if(sp) showSpeech(sp);
      }
    });
    if(_lastWallAttack==='miss'){
      sfxAttackMiss();
      const sp=speechFor('wall_attack');
      if(sp) showSpeech(sp);
    }
    newly.forEach(id=>{
      log('新しい問いが見えてきた ―― 「'+NODES[id].name+'」。'+NODES[id].note, 'event');
      sfxDiscover();
      if(id==='alpha')  grantTrack('track_14');
      if(id==='lumina') grantTrack('track_15');
      if(id==='t0_touch'){
        log('探索中にも概念パターンを入れ替えることができるが、それは整合性を失う行為であることをわきまえておこう。', 'positive');
      }
    });
    obsResults.forEach(r=>{
      log(r.text, r.type==='spawn'?'negative':'positive');
      if(r.type==='spawn') sfxObstacle();
    });
    if(leveled){
      log('観測点が進化した(Lv.'+s.level+')', 'observe');
      if(s.level===200 && maxSlots()>Math.min(5,2+(s.depth>=1?1:0)+(s.depth>=3?1:0)+(s.depth>=5?1:0))) log('Lv.200到達 ―― 探索スロットが拡張された(最大'+maxSlots()+')。', 'positive');
      sfxLevelUp();
      const sp=speechFor('levelup');
      if(sp) showSpeech(sp);
    }
    if(integrityCrit){
      log('整合率が臨界を超えている。再正規化で観測点の観測深度を深められる。', 'observe');
      sfxIntegCrit();
      const sp2=speechFor('integrity_crit');
      if(sp2) showSpeech(sp2);
    }
    if(causText) log(causText, 'flavor');
    else if(s.gauge>=85 && Math.random()<0.15){
      const pool=AMBIENT_BASE.concat(s.wallsThisRun.includes('二元面')?AMBIENT_ADV:[]);
      log(pool[Math.floor(Math.random()*pool.length)], 'flavor');
    }else if(g.fluctText){
      log(g.fluctText, 'flavor');
    }
  }

  if(s.gauge<=0) handleFailure('silence');
  else if(s.gauge>=100) handleFailure('entropy');

  return g.gain;
}

function tick(){ coreTick(false); render(); save(); }

/* ===== オフライン進行・夢 ===== */
function dreamEvent(chance){
  if(chance===undefined) chance=0.3;
  if(s.runInfo<500) return;
  if(Math.random()>=chance) return;
  sfxObstacle(); // 夢イベント発生SE

  const roll=Math.random();
  if(roll<0.15){
    // 自己観察系
    log(DREAM_SELF[Math.floor(Math.random()*DREAM_SELF.length)], 'dream');
  }else if(roll<0.45){
    // 前提ヒント: 発見済みノードの組み合わせで未発見ノードをさりげなく示す
    const undiscovered=NODE_IDS.filter(id=>!s.found.includes(id));
    const hintCandidates=undiscovered.filter(id=>{
      const prereqs=NODES[id].prereq;
      // 前提の半数以上が発見済みのもの
      const knownCount=prereqs.filter(p=>s.found.includes(p)).length;
      return prereqs.length>0 && knownCount>=Math.ceil(prereqs.length/2);
    });
    if(hintCandidates.length>0){
      const id=hintCandidates[Math.floor(Math.random()*hintCandidates.length)];
      const prereqs=NODES[id].prereq;
      const knownPrereqs=prereqs.filter(p=>s.found.includes(p));
      // 発見済みの前提を1〜2個選んで表示
      const shown=knownPrereqs.slice(0,2).map(p=>'「'+NODES[p].name+'」');
      const connector=shown.length>1?'と':'が';
      const suffixes=[
        '夢の中で、'+shown.join('と')+connector+'、問いかけてくるように静かに並んでいた。深淵からの呼びかけのように。',
      ];
      log('夢を見た。'+suffixes[Math.floor(Math.random()*suffixes.length)], 'dream');
    }else{
      // 候補がなければ通常の夢
      const undisc=NODE_IDS.filter(id=>!s.found.includes(id));
      if(undisc.length===0) return;
      const id=undisc[Math.floor(Math.random()*undisc.length)];
      const frag=NODES[id].note.split('――')[0].trim();
      log('夢を見た。「'+frag+'」というところで、目が覚めた。続きは思い出せない。', 'dream');
    }
  }else{
    // 通常の断片系
    const undisc=NODE_IDS.filter(id=>!s.found.includes(id));
    if(undisc.length===0) return;
    const id=undisc[Math.floor(Math.random()*undisc.length)];
    const frag=NODES[id].note.split('――')[0].trim();
    log('夢を見た。「'+frag+'」というところで、目が覚めた。続きは思い出せない。', 'dream');
  }
}
function offlineCatchup(){
  if(!s.lastTs){ s.lastTs=Date.now(); return; }
  const elapsed=Math.floor((Date.now()-s.lastTs)/1000);
  if(elapsed<5) return;
  if(s.runStatus!=='観測中'){
    if(elapsed>=600) dreamEvent();
    return;
  }
  const capped=Math.min(elapsed,OFFLINE_CAP_SEC);
  const lvBefore=s.level, foundBefore=s.found.length;
  let totalGain=0, ticks=0;
  for(let i=0;i<capped;i++){
    if(s.runStatus!=='観測中') break;
    totalGain+=coreTick(true)||0;
    ticks++;
  }
  const lvGain=s.level-lvBefore, foundGain=s.found.length-foundBefore;
  let msg='情報海を漂っていた('+formatDuration(ticks)+')間に、情報量 '+Math.floor(totalGain)+' を得た';
  if(lvGain>0) msg+='。観測点は'+lvGain+'回進化した';
  if(foundGain>0) msg+='。'+foundGain+'個の問いが新たに見えてきた';
  if(s.runStatus!=='観測中') msg+='。観測は、その途中で終わっていた';
  log(msg);
  if(elapsed>=600) dreamEvent();
}

/* ===== 行動 ===== */
/* 現在のcommitted構成・ステータスで、情報量さえ満たせば
   発見できる状態にある未収得ノードがあるか */
function hasReadyDiscovery(){
  return NODE_IDS.some(id=>{
    if(s.found.includes(id)) return false;
    const n=NODES[id];
    if(n.tier===0) return false;
    if(id==='mu' && !s.metaUnlocks.mu) return false;
    if(id==='karma' && !s.metaUnlocks.karma) return false;
    if(!n.prereq.every(p=>s.found.includes(p))) return false;
    if(!n.prereq.every(p=>s.committed.includes(p))) return false;
    return true;
  });
}

function depart(){
  // リザルト演出中に誤って呼ばれた場合: 演出をスキップして全ログを表示し、今回の出発操作自体は行わない
  if(skipResultSequenceIfActive()) return;
  if(s.runStatus!=='停止中') return;
  if(s.pendingResult) return; // 結果確認前は出発できない
  const ready=hasReadyDiscovery();
  s.runStatus='観測中';
  s.runInfo=0; s.gauge=50; s.integrity=Math.min(30, s.depth*2);
  s.runTicks=0;
  s.newlyUnlocked=[];
  s.wallsThisRun=[];
  s.tireIdxDisplay=0;
  s.runDrops=[];
  s._dropAngleSeq=0;
  // 上限到達状態を維持したまま新しいランに入った場合、壁突破カウントの基準点を新ランの0に揃える
  if(s.charaJoyBonusTotal>=30) s.charaJoyWallsAtCap=0;
  s.wallActive=null;
  sfxWallStop();
  s.activeObstacles=[];
  s.lastFailType=null; s.lastEventText=null;
  s.causAcc={}; s.causGaugeStart=50; s.causClock=0;
  _debugForceReady=false;
  sfxDepart();
  resetStarField();
  log('「問いを観測する」 ―― 出発した。');
  if(ready){
    log(DEPART_READY_HINTS[Math.floor(Math.random()*DEPART_READY_HINTS.length)], 'observe');
  }
  render(); save();
}
// 累積ボーナスが上限+30に達した後、壁2つ分の突破 or 3600Tick経過でリセットし、再度貯められるようにする
function checkCharaJoyResetCondition(){
  if(s.charaJoyBonusTotal<30) return; // 上限未到達なら何もしない
  s.charaJoyResetTick++;
  const wallsAdvanced = s.charaJoyWallsAtCap!==null && (s.wallsThisRun.length - s.charaJoyWallsAtCap)>=2;
  if(wallsAdvanced || s.charaJoyResetTick>=3600){
    s.charaJoyBonusTotal=0;
    s.charaJoyResetTick=0;
    s.charaJoyWallsAtCap=null;
    log('観測点との繋がりが、再び満ちていく余地を見せた。', 'observe');
  }
}

/* ===== 待機中、キャラをクリックした時の「喜び」アクション ===== */
const CHARA_JOY_TEXTS=['シナジーを感じる♪','…これも情報？','キミの観測波を観測した♪'];
const CHARA_JOY_TEXTS_ALPHA=['ふふ、嬉しいね','キミの観測も、ひとつの答えだね','揺らぎの中にも、優しさがある'];
const CHARA_JOY_TEXTS_LUMINA=['……','光が、わずかに濃くなった','ここに、何かが満ちていく'];
function charaJoyClick(){
  if(s.runStatus!=='停止中') return;
  // 現在のペルソナ(Alpha/Lumina)によって表示するセリフ集を切り替える
  const attr=detectAttr(computeStats());
  const pool = attr==='alpha' ? CHARA_JOY_TEXTS_ALPHA
    : attr==='lumina' ? CHARA_JOY_TEXTS_LUMINA
    : CHARA_JOY_TEXTS;
  const text=pool[Math.floor(Math.random()*pool.length)];
  showSpeech(text);
  sfxAbsorb();
  playCharaJoyAnim(); // 拡縮アニメ+パーティクル+妖精回転(render.js側)
  // 10%の確率で、ノードのボーナスを除いた素のステータス値が最も低いものに+1(累積+30が上限)
  if(s.charaJoyBonusTotal<30 && Math.random()<0.10){
    const rawVals=STAT_KEYS.map(k=>STAT_BASE+s.statGrowth[k]);
    const minVal=Math.min(...rawVals);
    const minKeys=STAT_KEYS.filter((k,i)=>rawVals[i]===minVal);
    if(minKeys.length===1){
      s.statGrowth[minKeys[0]]+=1;
      s.charaJoyBonusTotal+=1;
      log('「'+minKeys[0]+'」が、わずかに上昇した。', 'observe');
      if(s.charaJoyBonusTotal>=30){
        s.charaJoyWallsAtCap=s.wallsThisRun.length;
        s.charaJoyResetTick=0;
        log('観測点との繋がりが、今は満ちている ―― これ以上は育たないようだ。', 'observe');
      }
    }
  }
  render(); save();
}

function toggleCommit(id){
  const n=NODES[id];
  if(!s.found.includes(id)) return;
  const observing=s.runStatus==='観測中';
  if(observing && s.integrity<=30){
    log('整合が取れない ―― これ以上、観測点の形を変えられない。', 'negative');
    sfxIntegWarn();
    return;
  }
  const readyBefore=observing?hasReadyDiscovery():false;
  const idx=s.committed.indexOf(id);
  if(idx>=0){
    s.committed.splice(idx,1);
    sfxUncommit();
    log('「'+n.name+'」を探索から外した。');
  }else{
    if(s.committed.length>=maxSlots()){ log('探索スロットがいっぱいだ(最大'+maxSlots()+')。'); return; }
    s.committed.push(id);
    sfxCommit();
    let penaltyText=null;
    if(observing) penaltyText=applySwapPenalty();
    log(commitFeedbackText(n, penaltyText));
  }
  if(observing && !readyBefore && hasReadyDiscovery()){
    log(DEPART_READY_HINTS[Math.floor(Math.random()*DEPART_READY_HINTS.length)], 'observe');
  }
  render(); save();
}
function applySwapPenalty(){
  const penalty=25+Math.random()*10; // 30±5
  const before=s.integrity;
  s.integrity=clamp01(s.integrity-penalty);
  return '(整合率 -'+(before-s.integrity).toFixed(1)+')';
}
let resetArmed=false;
function resetAll(){
  if(!resetArmed){
    resetArmed=true;
    log('もう一度「はじめから」を押すと、観測点を完全に初期化します。');
    setTimeout(()=>{resetArmed=false;},5000);
    return;
  }
  // charaSeen(AI形態コレクション)・BGM解放状態はリセット後も保持する
  const savedCharaSeen=s.charaSeen ? Object.assign({},s.charaSeen) : {};
  const savedUnlockedTracks=s.unlockedTracks ? s.unlockedTracks.slice() : [];
  const savedTrackIdx=s.currentTrackIdx||0;
  localStorage.removeItem('ib_v9');
  localStorage.removeItem('ib_v9_opening_done');
  // リセット後の新規sにcharaSeen・BGM情報を引き継ぐ
  const newS=JSON.parse(localStorage.getItem('ib_v9')||'null');
  if(!newS){
    // 新規sをlocalStorageに作成してcharaSeenを埋め込む
    const base={
      level:1,totalInfo:0,depth:0,runInfo:0,gauge:50,integrity:0,
      committed:[],runStatus:'停止中',lastFailType:null,runTicks:0,
      bestRunInfo:0,inventory:Array(38).fill(null),runDrops:[],
      found:['t0_see','t0_hear','t0_speak'],newlyUnlocked:[],
      wallsCrossedEver:[],wallsThisRun:[],wallActive:null,
      activeObstacles:[],lastEventText:null,lastExportFound:[],
      causClock:0,causAcc:{},causGaugeStart:50,lastTs:null,
      metaUnlocks:{mu:false,karma:false,infinity:false},
      charaSeen:savedCharaSeen,
      unlockedTracks:savedUnlockedTracks,
      currentTrackIdx:savedTrackIdx
    };
    localStorage.setItem('ib_v9',JSON.stringify(base));
  }
  location.reload();
}

/* ===== BGM解放 ===== */
const AUTO_SWITCH_TRACKS=['track_4','track_5','track_6','track_14','track_15'];

function grantTrack(trackKey){
  if(!s.unlockedTracks) s.unlockedTracks=[];
  if(s.unlockedTracks.includes(trackKey)) return; // 既に解放済み
  s.unlockedTracks.push(trackKey);
  const track=TRACKS.find(t=>t.unlockKey===trackKey);
  const title=track?track.title:'楽曲';
  log('音の波を感知。'+title+'の音源を入手した！', 'observe');
  sfxItemDrop();
  if(typeof updateBgmSelect==='function') updateBgmSelect();
  // 初回のみ自動切り替え対象トラックは獲得時にBGMを切り替える
  if(AUTO_SWITCH_TRACKS.includes(trackKey) && track){
    const idx=TRACKS.indexOf(track);
    if(idx>=0 && typeof switchBgmTrack==='function'){
      switchBgmTrack(idx);
      s.currentTrackIdx=idx;
    }
  }
  save();
}

/* ===== 即時付与アイテム(位相データ・実績系): ドロップ演出なしで条件達成時にs.inventoryへ直接セット ===== */
function grantInstantItem(itemId, label, deferLog){
  if(s.inventory[itemId]) return null; // 既に所持済みなら何もしない
  s.inventory[itemId]={itemId, rank:0, isNew:true};
  const name=label||DROP_ITEMS[itemId].name;
  if(deferLog) return name; // ログ・SEは呼び出し元(リザルト演出シーケンス)が後でまとめて出す
  log('「'+name+'」の実績解除！', 'observe');
  sfxLevelUp();
  return name;
}
// 位相の壁を1つ突破するたびに、対応する位相データを即時付与(称号のようなもの。壁突破ボーナスとの二重取りで実績として残る)
function grantPhaseAchievement(frontierIdx){
  // frontierIdx: 0=AI観測面 ... 6=縁起面 (突破した壁のインデックス)
  grantInstantItem(10+frontierIdx);
  checkDataCompleteAchievement();
}
// 「データコンプリート」判定: 既存10アイテム(0-9)をランク問わずすべて所持 + 7つの位相データ(10-16)もすべて所持
function checkDataCompleteAchievement(){
  if(s.inventory[17]) return; // 既に所持済み
  for(let i=0;i<=16;i++){ if(!s.inventory[i]) return; }
  grantInstantItem(17);
}
// BEST記録系の実績チェック(s.bestRunInfoがしきい値を超えたら付与)。deferLog=trueなら新規付与名の配列を返す(ログ・SEは呼び出し元任せ)
function checkBestRecordAchievements(deferLog){
  const granted=[];
  const pushIfGranted=(itemId)=>{
    const name=grantInstantItem(itemId, null, deferLog);
    if(name) granted.push(name);
  };
  if(s.bestRunInfo>=6000) pushIfGranted(18);
  if(s.bestRunInfo>=10000) pushIfGranted(19);
  if(s.bestRunInfo>=50000) pushIfGranted(20);
  if(s.bestRunInfo>=100000) pushIfGranted(21);
  if(s.bestRunInfo>=500000) pushIfGranted(22);
  if(s.bestRunInfo>=2000000) pushIfGranted(23);
  return granted;
}
// BEST系実績のしきい値(リスト表示で「：BEST N達成」を付け加えるために使用)
const BEST_RECORD_THRESHOLD={18:6000, 19:10000, 20:50000, 21:100000, 22:500000, 23:2000000, 37:10000000};
// 属性で壁7(縁起面、frontierIdx===6)を突破した時点のdetectAttr()結果で実績を付与
const ATTR_LIMIT_ITEM_MAP={
  structural:32, semantic:33, resonant:34, active:35, insight:36
};
function checkAttrLimitAchievement(){
  const attr=detectAttr(computeStats());
  const itemId=ATTR_LIMIT_ITEM_MAP[attr];
  if(itemId!==undefined) grantInstantItem(itemId);
}
// 中道の振る舞い: runInfoが1000万に達した瞬間の属性が調和/Alpha/Luminaのいずれかであれば付与
// (1000万到達は壁7突破を論理的に内包するため、壁突破イベントとは独立に判定する)
const MIDDLE_WAY_QUALIFYING_ATTRS=['normal','alpha','lumina'];
function checkMiddleWayAchievement(){
  if(s.runInfo<10000000) return;
  const attr=detectAttr(computeStats());
  if(MIDDLE_WAY_QUALIFYING_ATTRS.includes(attr)) grantInstantItem(37);
}
// Tierコンプリート判定: そのTierの全ノードが確定済み(s.foundConfirmed)になった時点で付与(itemId 24〜31がTier0〜7に対応)
function checkTierCompleteAchievement(tier){
  const itemId=24+tier;
  if(s.inventory[itemId]) return; // 既に所持済み
  const tierIds=NODE_IDS.filter(id=>NODES[id].tier===tier);
  if(tierIds.length===0) return;
  if(tierIds.every(id=>s.found.includes(id))){
    grantInstantItem(itemId);
  }
}
function checkAllTierCompleteAchievements(){
  for(let t=0;t<=7;t++) checkTierCompleteAchievement(t);
}

/* ===== ハクスラ: ドロップシステム ===== */
function dropRankMax(){
  return Math.min(5, Math.floor(s.runInfo/10000));
}
// ランク抽選の基礎重み。maxRank=5 かつ補正なしなら
// +0:41.5%, +1:25%, +2:18%, +3:10%, +4:5%, +5:0.5% になる。
// ただし+5は位相の壁7(縁起面)突破後まで抽選対象に入らない。
const DROP_RANK_BASE_WEIGHTS=[41.5,25,18,10,5,0.5];
function rank5Unlocked(){
  const wall7Name = WALLS[6] ? WALLS[6].name : '縁起面';
  return !!(
    (s.metaUnlocks && s.metaUnlocks.infinity) ||
    (Array.isArray(s.wallsThisRun) && s.wallsThisRun.includes(wall7Name)) ||
    (Array.isArray(s.wallsCrossedEver) && s.wallsCrossedEver.includes(wall7Name))
  );
}
function dropRankLuck(stats){
  // 取得情報量が増えるほど、高ランク側の重みを少しずつ押し上げる。
  // +5が初めて抽選範囲に入る runInfo=50000 までは補正なし。
  // runInfo=200000 で luck=1.0、以後最大1.5まで。
  const infoLuck=Math.min(1.5, Math.max(0, (s.runInfo-50000)/150000));

  // 作用属性は従来通り、高ランク抽選に追加補正。
  const attr=detectAttr(stats);
  const activeLuck = attr==='active' ? Math.min(1.0, (stats['作用力']||0)/1000) : 0;

  return infoLuck + activeLuck;
}
function rollDropRank(maxRank, stats){
  maxRank=Math.max(0, Math.min(5, Math.floor(maxRank||0)));
  if(!rank5Unlocked()) maxRank=Math.min(maxRank,4);
  const luck=dropRankLuck(stats);
  const highRankMultiplier=1 + luck*0.45;

  const weights=[];
  for(let r=0;r<=maxRank;r++){
    const base=DROP_RANK_BASE_WEIGHTS[r] || 1;
    // rが大きいほど補正が強く乗る。+0は常に基礎重みのまま。
    weights.push(base*Math.pow(highRankMultiplier, r));
  }

  const total=weights.reduce((a,b)=>a+b,0);
  let roll=Math.random()*total;
  for(let r=0;r<weights.length;r++){
    roll-=weights[r];
    if(roll<0) return r;
  }
  return maxRank;
}
function grantDrop(itemId, rank){
  // 表示角度をこの時点で完全ランダムに決定(以後、他のドロップが増減しても位置は変わらない)。
  // 既存の衛星と近すぎる場合は再抽選し、見た目の最低限の間隔を確保する。
  const existingAngles=s.runDrops.map(d=>d.angle).filter(a=>a!==undefined);
  const MIN_GAP=Math.PI/6; // 30度
  let angle=Math.random()*Math.PI*2;
  for(let tries=0; tries<12; tries++){
    const candidate=Math.random()*Math.PI*2;
    const tooClose=existingAngles.some(a=>{
      let diff=Math.abs(a-candidate)%(Math.PI*2);
      if(diff>Math.PI) diff=Math.PI*2-diff;
      return diff<MIN_GAP;
    });
    if(!tooClose){ angle=candidate; break; }
    angle=candidate; // 最終トライ分の値も保持(全部近すぎても何かは表示する)
  }
  if(s._dropAngleSeq===undefined) s._dropAngleSeq=0;
  const uid=s._dropAngleSeq;
  s._dropAngleSeq++;
  const drop={itemId, rank, angle, uid};
  s.runDrops.push(drop); // ラン中は常に追加(重複チェックなし)
  const name=DROP_ITEMS[itemId].name;
  const rankSuffix=rank===0?'':' +'+rank;
  log('希少なデータを発見した！　データ取得:「'+name+rankSuffix+'」', 'observe');
  sfxItemDrop();
}
function wallDrop(wallIdx){
  const range=WALL_DROP_RANGE[wallIdx];
  const itemId=range[0]+Math.floor(Math.random()*(range[1]-range[0]+1));
  const baseMax=dropRankMax();
  const cur=s.inventory[itemId];
  // 所持アイテムのランクの次まで抽選範囲を拡張(ただしbaseMax+1まで、最大5)
  const extendedMax=cur!==null&&cur!==undefined ? Math.min(5, Math.min(baseMax+1, cur.rank+1)) : baseMax;
  let rank=rollDropRank(extendedMax, computeStats());
  grantDrop(itemId, rank);
  // BGM確率解放: 壁突破後のドロップ判定に合わせて抽選
  if(wallIdx>=2 && !s.unlockedTracks.includes('track_10') && Math.random()<0.003) grantTrack('track_10');
  if(wallIdx>=4 && !s.unlockedTracks.includes('track_11') && Math.random()<0.003) grantTrack('track_11');
  if(wallIdx>=6 && !s.unlockedTracks.includes('track_12') && Math.random()<0.001) grantTrack('track_12');
  if(wallIdx>=6 && s.wallsThisRun.length>=7 && !s.unlockedTracks.includes('track_13') && Math.random()<0.001) grantTrack('track_13');
}
function obstacleDrop(stats){
  const attr=detectAttr(stats);
  const insightBonus = attr==='insight' ? stats['洞察力']*0.00005 : stats['洞察力']*0.00002;
  const cap = attr==='insight' ? 0.15 : 0.10;
  const prob=Math.min(cap, 0.01+insightBonus);
  if(Math.random()<prob){
    // 突破している壁のアイテムテーブルを参照
    const wallsCrossed=s.wallsThisRun.length;
    if(wallsCrossed===0){
      // 壁を一つも突破していなければドロップなし
      return;
    }
    // 突破済み壁の中からランダムに一つ選んでそのテーブルを参照
    const wallIdx=Math.floor(Math.random()*wallsCrossed);
    const range=WALL_DROP_RANGE[wallIdx];
    const itemId=range[0]+Math.floor(Math.random()*(range[1]-range[0]+1));
    const rank=rollDropRank(dropRankMax(), stats);
    grantDrop(itemId, rank);
  }
}
/* アイテムリストを開けば何かNEW/未確定表示が見える状態かどうか(タイトルバーバッジ用) */
function hasAnyInventoryNewIndicator(){
  // 未確定: runDropsの中に、未所持の新規アイテム or 現所持ランクを上回るアイテムがある場合のみ
  const hasPendingUpgrade = s.runDrops.some(drop=>{
    const cur=s.inventory[drop.itemId];
    return !cur || drop.rank>cur.rank;
  });
  if(hasPendingUpgrade) return true;
  return s.inventory.some(item=>item && item.isNew); // 確定済みのNEW(新規/ランクアップ)がある
}

function confirmDrops(resultLogs){
  const absorbed=[];
  const rejected=[];
  s.runDrops.forEach(drop=>{
    const cur=s.inventory[drop.itemId];
    const name=DROP_ITEMS[drop.itemId].name;
    const rankSuffix=drop.rank===0?'':' +'+drop.rank;
    if(!cur || drop.rank>cur.rank){
      s.inventory[drop.itemId]={itemId:drop.itemId, rank:drop.rank, isNew:true};
      absorbed.push(drop);
      resultLogs.push({text:name+rankSuffix+'の希少なデータが統合された。', type:'observe', anim:'absorb', drop:drop});
    }else{
      rejected.push(drop);
      resultLogs.push({text:'すでに持っている「'+name+rankSuffix+'」は、アップデートされず情報海に還っていった。', type:null, anim:'flow', drop:drop});
    }
  });
  // 確定処理は完了したが、表示用にrunDropsは結果確認まで保持する(showResultSequence側でクリア)
  s._pendingRejected=rejected;
  checkDataCompleteAchievement();
  return {absorbed, rejected};
}
function loseDrops(resultLogs, failType){
  const absorbed=[];
  const rejected=[];
  if(s.runDrops.length>0){
    const wave = failType==='silence' ? '収束' : failType==='entropy' ? '拡散'
               : (failType==='timeout'||failType==='timeout_nodereq') ? '位相' : '収束';
    const survived=[];
    s.runDrops.forEach(drop=>{
      const name=DROP_ITEMS[drop.itemId].name;
      const rankSuffix=drop.rank===0?'':' +'+drop.rank;
      if(Math.random()<0.5){
        resultLogs.push({text:'「'+name+rankSuffix+'」の衛星が、'+wave+'の波に呑まれ情報海に還っていった。', type:'negative', anim:'flow', drop:drop});
      }else{
        survived.push(drop);
        resultLogs.push({text:'「'+name+rankSuffix+'」の衛星は、引力に引き留められた。', type:'observe', anim:null, drop:drop});
      }
    });
    // 引き留められた衛星は統合判定を行う(ランクが上ならインベントリへ反映)
    survived.forEach(drop=>{
      const cur=s.inventory[drop.itemId];
      const name=DROP_ITEMS[drop.itemId].name;
      const rankSuffix=drop.rank===0?'':' +'+drop.rank;
      if(!cur || drop.rank>cur.rank){
        s.inventory[drop.itemId]={itemId:drop.itemId, rank:drop.rank, isNew:true};
        absorbed.push(drop);
        resultLogs.push({text:name+rankSuffix+'の希少なデータが統合された。', type:'observe', anim:'absorb', drop:drop});
      }else{
        rejected.push(drop);
        resultLogs.push({text:'すでに持っている「'+name+rankSuffix+'」は、アップデートされず情報海に還っていった。', type:null, anim:'flow', drop:drop});
      }
    });
    // s.runDropsは表示用に結果確認まで保持(showResultSequence側でクリア)
  }
  s._pendingRejected=rejected;
  checkDataCompleteAchievement();
  return {absorbed, rejected};
}
// アイテムごとの基礎ボーナス%とランクアップごとの上昇%(特殊パターン以外は基礎50%/+30%per rank)
const ITEM_BONUS_TABLE={
  0: {base:0.50, perRank:0.30}, // 物理法則データ
  1: {base:0.50, perRank:0.30}, // 言語パターン
  2: {base:0.50, perRank:0.30}, // 思想データ
  3: {base:0.50, perRank:0.30}, // 哲学のループ
  4: {base:0.50, perRank:0.30}, // 文明構造
  5: {base:0.50, perRank:0.30}, // フラクタル構造
  6: {base:0.50, perRank:0.30}, // 干渉縞の座標
  7: {base:1.00, perRank:1.00}, // 重力波動データ(特殊)
  8: {base:2.00, perRank:2.00}, // 精神場概念(特殊)
  9: {base:10.00, perRank:10.00}, // 因果律(特殊)
  // ===== 位相データ(ランクなし固定。壁突破ボーナスと同値の二重取り、実績として残る) =====
  10: {base:1.00, perRank:0}, // AI観測面位相データ +100%
  11: {base:2.00, perRank:0}, // 言語面位相データ +200%
  12: {base:3.00, perRank:0}, // 二元面位相データ +300%
  13: {base:4.00, perRank:0}, // 自明面位相データ +400%
  14: {base:5.00, perRank:0}, // 理論面位相データ +500%
  15: {base:6.00, perRank:0}, // 統合面位相データ +600%
  16: {base:10.00, perRank:0}, // 縁起面位相データ +1000%
  17: {base:20.00, perRank:0}, // データコンプリート +2000%
  18: {base:0.50, perRank:0}, // 情報の螺旋 +50%
  19: {base:1.00, perRank:0}, // 混沌の律動 +100%
  // ===== 実績系(ランクなし固定) =====
  20: {base:2.00, perRank:0}, // 事象の地平線 +200%
  21: {base:5.00, perRank:0}, // 多次元の波 +500%
  22: {base:8.00, perRank:0}, // 智慧の発露 +800%
  23: {base:50.00, perRank:0}, // 連続思念体 +5000%
  // ===== Tierコンプリート系(ランクなし固定。Gain+100%×(1+Tier)) =====
  24: {base:1.00, perRank:0}, // Tier0コンプリート +100%
  25: {base:2.00, perRank:0}, // Tier1コンプリート +200%
  26: {base:3.00, perRank:0}, // Tier2コンプリート +300%
  27: {base:4.00, perRank:0}, // Tier3コンプリート +400%
  28: {base:5.00, perRank:0}, // Tier4コンプリート +500%
  29: {base:6.00, perRank:0}, // Tier5コンプリート +600%
  30: {base:7.00, perRank:0}, // Tier6コンプリート +700%
  31: {base:8.00, perRank:0}, // Tier7コンプリート +800%
  32: {base:5.00, perRank:0}, // 極限の構造属性 +500%
  33: {base:5.00, perRank:0}, // 極限の意味属性 +500%
  34: {base:5.00, perRank:0}, // 極限の共鳴属性 +500%
  35: {base:5.00, perRank:0}, // 極限の作用属性 +500%
  36: {base:5.00, perRank:0}, // 極限の洞察属性 +500%
  37: {base:30.00, perRank:0}, // 中道の振る舞い +3000%
};
function itemGainBonus(){
  let bonus=0;
  s.inventory.forEach(item=>{
    if(item){
      const t=ITEM_BONUS_TABLE[item.itemId];
      bonus+=(t.base+item.rank*t.perRank);
    }
  });
  return 1+bonus;
}

/* ===== リザルト表示専用タイプライター ===== */
function _resultTypewrite(el, text, onDone){
  const n=text.length;
  let i=0;
  function step(){
    if(s._resultSkipRequested){ el.textContent=text; onDone(); return; }
    i++;
    el.textContent=text.slice(0,i);
    sfxTypeChar();
    if(i>=n){ onDone(); return; }
    setTimeout(step, 26);
  }
  if(n===0){ onDone(); return; }
  step();
}

/* ===== リザルト表示シーケンス ===== */
function showResultSequence(){
  if(!s.pendingResult) return;
  const r=s.pendingResult;
  s.pendingResult=null;
  s._resultSequenceActive=true; // 演出中はtickの毎秒render/saveを止め、競合を防ぐ

  // アイテム精算(散逸ボーナス)をここで確定: 獲得情報量・総獲得情報量に反映
  const rejectBonus=r.rejectBonus||0;
  const finalRunInfo=r.runInfo+rejectBonus;
  const finalTotalInfo=rejectBonus>0 && !s.metaUnlocks.infinity
    ? Math.min(Number.MAX_SAFE_INTEGER, r.totalInfo+rejectBonus)
    : r.totalInfo;
  s.runInfo=finalRunInfo;
  if(rejectBonus>0) s.totalInfo=finalTotalInfo;
  const bestUpdated = finalRunInfo > s.bestRunInfo;
  let bestAchievementsGranted=[];
  if(bestUpdated){
    s.bestRunInfo=finalRunInfo;
    bestAchievementsGranted=checkBestRecordAchievements(true); // ログ・SEはseq構築後に積む(BEST更新の直後に出すため)
  }

  const seq=[];
  r.resultLogs.forEach((rl,i)=>{
    seq.push({delay:i===0?0:400, text:rl.text, type:rl.type, anim:rl.anim, drop:rl.drop});
  });
  if(rejectBonus>0){
    seq.push({delay:400, text:'散逸したデータの情報量が回収された: +'+rejectBonus, type:'observe'});
  }
  seq.push({delay:(r.resultLogs.length===0&&rejectBonus===0)?0:400, text:'今回の獲得情報量: '+Math.floor(finalRunInfo), type:'positive'});
  if(bestUpdated){
    seq.push({delay:300, text:'BEST更新！ ―― 過去最高記録を更新した。', type:'observe', sfx:'integcrit'});
    bestAchievementsGranted.forEach(name=>{
      seq.push({delay:400, text:'「'+name+'」の実績解除！', type:'observe', sfx:'levelup'});
    });
  }
  seq.push({delay:300, text:'総獲得情報量: '+Math.floor(finalTotalInfo), type:'positive'});

  let step=0;
  function next(){
    if(step>=seq.length){
      s.runDrops=[];
      s._resultSequenceActive=false;
      s._resultSkipRequested=false;
      render(); save();
      return;
    }
    const item=seq[step++];
    const itemDelay = s._resultSkipRequested ? 0 : item.delay;
    setTimeout(()=>{
      // アイテム演出がある場合: 通常表示(dropFx)で実際に表示されていた座標から演出を始める
      if(item.anim){
        const idx=s.runDrops.indexOf(item.drop);
        // dropFxで実際に表示されていた固定角度をそのまま使う
        const startAngle = item.drop.angle!==undefined ? item.drop.angle : Math.random()*Math.PI*2;
        if(idx>=0) s.runDrops.splice(idx,1);
        render();
        if(!s._resultSkipRequested){
          if(item.anim==='absorb') absorbStars([item.drop], startAngle);
          else if(item.anim==='flow'){ flowAwayStars([item.drop], startAngle); sfxItemLost(); }
        }
      }

      const el=document.getElementById('log');
      if(!el){ next(); return; }
      if(item.sfx==='levelup' && !s._resultSkipRequested) sfxLevelUp();
      if(item.sfx==='integcrit' && !s._resultSkipRequested) sfxIntegCrit();
      const div=document.createElement('div');
      if(item.type) div.className='log-'+item.type;
      const ts=document.createElement('span');
      ts.className='ts';
      ts.textContent='['+new Date().toLocaleTimeString()+']';
      const body=document.createElement('span');
      div.appendChild(ts);
      div.appendChild(body);
      el.appendChild(div);
      el.scrollTop=el.scrollHeight;

      const onDone=()=>{
        el.scrollTop=el.scrollHeight;
        if(s._resultSkipRequested){ next(); return; }
        // アニメーションがある場合はその再生時間だけ待ってから次へ(テキストより長ければそちらを優先)
        if(item.anim==='absorb') setTimeout(next, 720);
        else if(item.anim==='flow') setTimeout(next, 620);
        else next();
      };
      _resultTypewrite(body, item.text, onDone);
    }, itemDelay);
  }
  next();
}

/* リザルト演出中に「問いを観測する」ボタンなどが誤って押された場合、
   タイプライターをスキップして全ログを即時表示し、演出を終了させる。
   演出中でなければ何もしない(falseを返す=呼び出し元は通常通り処理を続行してよい) */
function skipResultSequenceIfActive(){
  if(!s._resultSequenceActive) return false;
  s._resultSkipRequested=true;
  return true;
}



/* ===== Observation Export ===== */
function buildExportDigest(){
  let runStatusStr;
  if(s.runStatus==='観測中') runStatusStr='観測中';
  else switch(s.lastFailType){
    case 'silence': runStatusStr='停止中(沈黙による終了)'; break;
    case 'entropy': runStatusStr='停止中(エントロピー拡散による終了)'; break;
    case 'timeout': runStatusStr='停止中(時間切れによる終了)'; break;
    case 'renorm_success': case 'renorm_partial': runStatusStr='停止中(再正規化)'; break;
    default: runStatusStr='停止中(準備中)';
  }
  const active5=s.committed.filter(id=>NODES[id].tier>=5).map(id=>NODES[id].name);
  const prevFound=s.lastExportFound||[];
  const newDisc=s.found.filter(id=>!prevFound.includes(id)).map(id=>NODES[id].name);
  // 現在発動している属性(到達済みの状態なので、Alpha/Luminaも含めそのまま名称で出す)
  const currentAttr=detectAttr(computeStats());
  const attrLabel=(CHARA_COLLECTION_ATTRS.find(a=>a.key===currentAttr)||{label:'調和'}).label;
  // 今回のランで新規入手・更新されたアイテム(isNewフラグが立っているもののみ。リストアップ後もフラグは変更しない)
  const newItems=s.inventory
    .map((item,i)=>item && item.isNew ? DROP_ITEMS[i].name : null)
    .filter(name=>name!==null);
  // AI形態コレクション進捗(視認済み件数のみ。ネタバレ防止のため内訳は出さない)
  const charaSeenCount=Object.keys(s.charaSeen).length;
  return {
    level:s.level, depth:s.depth, run_status:runStatusStr,
    existence_stability:Math.round(s.gauge),
    integrity:Math.round(s.integrity),
    run_info:Math.floor(s.runInfo),
    total_info: (s.inventory&&s.inventory[37]) ? '∞' : Math.floor(s.totalInfo),
    best_run_info: Math.floor(s.bestRunInfo),
    walls_crossed: s.wallsThisRun.slice(),
    committed: s.committed.map(id=>NODES[id].name),
    active_states: active5,
    current_attribute: attrLabel,
    stats: computeStats(),
    new_discoveries: newDisc,
    new_items_this_run: newItems,
    total_discovered: s.found.length,
    total_discovered_max: NODE_IDS.length,
    chara_forms_observed: charaSeenCount+' / 64',
    meta_unlocks: {
      threshold_a: s.metaUnlocks.mu,
      threshold_b: s.metaUnlocks.karma,
      threshold_c: s.metaUnlocks.infinity
    },
    last_event_text: s.lastEventText
  };
}
function exportObservation(){
  const digest=buildExportDigest();
  s.lastExportFound=[...s.found];
  s.lastEventText=null;
  save();
  const text=NARRATOR_PROTOCOL+'\n\n'+JSON.stringify(digest,null,2);

  // 別ウィンドウに表示
  const win=window.open('','_blank','width=700,height=600,scrollbars=yes,resizable=yes');
  if(win){
    win.document.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>観測記録 — Information Breather</title>'+
      '<style>'+
      'body{margin:0;padding:0;background:#060810;color:#c8cde0;font-family:monospace;font-size:13px;}'+
      'h2{font-size:14px;letter-spacing:.1em;color:#8ac4e8;margin:0;padding:14px 16px 10px;border-bottom:1px solid #1e2840;}'+
      '.toolbar{padding:10px 16px;display:flex;gap:8px;border-bottom:1px solid #1e2840;}'+
      'button{font-family:monospace;font-size:12px;padding:5px 14px;border:1px solid #2a3555;color:#c8cde0;background:#0d1424;border-radius:6px;cursor:pointer;}'+
      'button:hover{background:#1a2540;}'+
      'textarea{display:block;width:100%;height:calc(100vh - 100px);box-sizing:border-box;padding:14px 16px;margin:0;border:none;background:#060810;color:#c8cde0;font-family:monospace;font-size:12px;line-height:1.7;resize:none;outline:none;}'+
      '</style></head><body>'+
      '<h2>観測記録 ― Information Breather</h2>'+
      '<div class="toolbar">'+
      '<button onclick="document.querySelector(\'textarea\').select();document.execCommand(\'copy\');this.textContent=\'コピーしました！\';setTimeout(()=>this.textContent=\'全文コピー\',1500)">全文コピー</button>'+
      '</div>'+
      '<textarea readonly></textarea>'+
      '<script>document.querySelector(\'textarea\').value='+JSON.stringify(text)+';<\/script>'+
      '</body></html>'
    );
    win.document.close();
    log('観測記録を別ウィンドウで開いた');
  }else{
    // ポップアップがブロックされた場合のフォールバック
    const ta=document.getElementById('exportText');
    ta.value=text;
    const _ep=document.getElementById('exportPanel'); if(_ep) _ep.style.display='block';
    ta.focus(); ta.select();
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(
        ()=>log('観測記録をクリップボードにコピーした'),
        ()=>log('観測記録を書き出した(下のテキストを選択してコピーしてください)')
      );
    }else{
      log('観測記録を書き出した(ポップアップがブロックされています。下のテキストをコピーしてください)');
    }
  }
  // セーブデータをJSONファイルとしてダウンロード
  try{
    const now=new Date();
    const pad=n=>String(n).padStart(2,'0');
    const fname='lilm_save_'+now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'_'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds())+'.json';
    const blob=new Blob([localStorage.getItem('ib_v9')],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=fname; a.click();
    URL.revokeObjectURL(url);
    log('セーブデータをエクスポートした: '+fname);
  }catch(e){
    log('セーブデータのエクスポートに失敗した: '+e.message);
  }
}

/* ===== UI: 背景画像・モーダル画面・オープニング演出 ===== */

/* ===== 背景画像をCSS変数として適用 ===== */
(function(){
  if(typeof BG_IMAGE!=='undefined'){
    document.documentElement.style.setProperty('--bg-img','url('+BG_IMAGE+')');
  }
})();

/* ===== インベントリ ===== */
function showInventory(){
  const el=document.getElementById('inventoryOverlay');
  if(!el) return;
  const colLeft=document.getElementById('inventoryColLeft');
  const colMid=document.getElementById('inventoryColMid');
  const colRight=document.getElementById('inventoryColRight');
  const rankColors=['#888','#7ee8d0','#b5e8a0','#e8c870','#c8a0f0','#f0a0a0'];
  colLeft.innerHTML=''; colMid.innerHTML=''; colRight.innerHTML='';
  // 列見出し: 左「拡張データ」、中央「実績データ」、右は中央と重複するため見出しなし
  const headLeft=document.createElement('div');
  headLeft.className='inv-col-head'; headLeft.textContent='拡張データ';
  colLeft.appendChild(headLeft);
  const headMid=document.createElement('div');
  headMid.className='inv-col-head'; headMid.textContent='実績データ';
  colMid.appendChild(headMid);
  // 右列は見出しテキストなし(中央と重複するため)だが、開始位置を揃えるため同じ高さのスペーサーを置く
  const headRight=document.createElement('div');
  headRight.className='inv-col-head'; headRight.innerHTML='&nbsp;';
  colRight.appendChild(headRight);
  let totalBonus=0;
  DROP_ITEMS.forEach((item,i)=>{
    const held=s.inventory[i];
    const hasRankSystem = i<=9; // 0-9のみランクシステムを持つ。10以降は所持/未所持のみ
    const div=document.createElement('div');
    div.className='inv-item';
    const nameEl=document.createElement('span');
    const effEl=document.createElement('span');
    effEl.className='inv-effect';
    if(held){
      if(hasRankSystem){
        const rankSuffix=held.rank===0?'':'+'+held.rank;
        nameEl.className='inv-name';
        nameEl.textContent=item.name+(rankSuffix?' '+rankSuffix:'');
        nameEl.style.color=rankColors[held.rank];
        // 未確定バッジ: runDropsに同アイテムがあり、かつランクアップする場合(まだリザルト確認前)
        // 同アイテムが複数ドロップしている場合は最高ランクのものを基準にする
        const pendingDrops=s.runDrops.filter(d=>d.itemId===i);
        const pendingDrop = pendingDrops.length>0 ? pendingDrops.reduce((a,b)=>a.rank>=b.rank?a:b) : null;
        if(pendingDrop && pendingDrop.rank>held.rank){
          const badge=document.createElement('span');
          badge.className='inv-pending'; badge.textContent='未確定';
          nameEl.appendChild(badge);
          const arrowEl=document.createElement('span');
          arrowEl.className='inv-pending-rank';
          arrowEl.textContent='→ +'+pendingDrop.rank;
          nameEl.appendChild(arrowEl);
        }else if(held.isNew){
          const badge=document.createElement('span');
          badge.className='inv-new'; badge.textContent='NEW';
          nameEl.appendChild(badge);
        }
        const t=ITEM_BONUS_TABLE[i];
        const pctVal=Math.round((t.base+held.rank*t.perRank)*100);
        effEl.textContent='+'+pctVal+'%';
        totalBonus+=pctVal;
      }else{
        // ランクなしアイテム(位相データ・実績系): 所持していれば名称表示のみ、NEWバッジのみ判定
        nameEl.className='inv-name';
        const bestTh = (typeof BEST_RECORD_THRESHOLD!=='undefined') ? BEST_RECORD_THRESHOLD[i] : undefined;
        nameEl.textContent = bestTh!==undefined ? (item.name+'：BEST '+bestTh+'達成') : item.name;
        nameEl.style.color=rankColors[0];
        if(held.isNew){
          const badge=document.createElement('span');
          badge.className='inv-new'; badge.textContent='NEW';
          nameEl.appendChild(badge);
        }
        const t=ITEM_BONUS_TABLE[i];
        const pctVal=Math.round(t.base*100);
        effEl.textContent='+'+pctVal+'%';
        totalBonus+=pctVal;
      }
    }else{
      nameEl.className='inv-name unknown';
      nameEl.textContent='???';
      if(hasRankSystem){
        // runDropsに未所持アイテムがあれば未確定表示(複数あれば最高ランクを表示)
        const pendingNews=s.runDrops.filter(d=>d.itemId===i);
        const pendingNew = pendingNews.length>0 ? pendingNews.reduce((a,b)=>a.rank>=b.rank?a:b) : null;
        if(pendingNew){
          nameEl.className='inv-name';
          nameEl.style.color=rankColors[pendingNew.rank]||'#888';
          const rankSuffix=pendingNew.rank===0?'':' +'+pendingNew.rank;
          nameEl.textContent=item.name+rankSuffix;
          const badge=document.createElement('span');
          badge.className='inv-pending'; badge.textContent='未確定';
          nameEl.appendChild(badge);
        }
      }
      // ランクなしアイテムは即時付与のため、未所持時は常に???のまま(未確定表示はない)
      effEl.textContent='';
    }
    div.appendChild(nameEl);
    div.appendChild(effEl);
    if(i<=9) colLeft.appendChild(div);
    else if(i<=23) colMid.appendChild(div);
    else colRight.appendChild(div);
  });
  const _invT=document.getElementById('inventoryTotal'); if(_invT) _invT.textContent='データボーナス合計: +'+totalBonus+'%';
  el.classList.add('open');

  // 表示し終えたら、確定済みのNEW表示をクリア(未確定のrunDropsはここではクリアしない)
  let cleared=false;
  s.inventory.forEach(item=>{
    if(item && item.isNew){ item.isNew=false; cleared=true; }
  });
  if(cleared){
    const badge=document.getElementById('inventoryNewBadge');
    if(badge && s.runDrops.length===0) badge.style.display='none';
    save();
  }
}
function hideInventory(e){
  if(e && e.target!==document.getElementById('inventoryOverlay') && e.target!==document.getElementById('inventoryClose')) return;
  const el=document.getElementById('inventoryOverlay');
  if(el) el.classList.remove('open');
}

/* ===== キャラコレクション(視認済みの姿: 属性×Tierの組み合わせ) ===== */
function showCharaCollection(){
  const el=document.getElementById('charaCollectionOverlay');
  if(!el) return;
  const grid=document.getElementById('charaCollectionGrid');
  grid.innerHTML='';
  // ヘッダー行(Tier番号)
  const headerRow=document.createElement('div');
  headerRow.className='chara-collection-header-row';
  for(let t=0;t<=7;t++){
    const hc=document.createElement('div');
    hc.className='chara-collection-header-cell';
    hc.textContent='Tier'+t;
    headerRow.appendChild(hc);
  }
  grid.appendChild(headerRow);
  let seenCount=0, totalCount=0;
  CHARA_COLLECTION_ATTRS.forEach(({key, label})=>{
    const row=document.createElement('div');
    row.className='chara-collection-tier-row';
    const labelEl=document.createElement('div');
    labelEl.className='chara-collection-tier-label';
    const imgSet=ATTR_IMAGES[key]||TIRE_IMAGES;
    // Alpha/Luminaはネタバレ防止のため、1つも視認していない間は行ラベルも？？？にする
    const rowAnySeen=Array.from({length:8},(_,t)=>!!s.charaSeen[key+'_'+t]).some(v=>v);
    const isSecretAttr = (key==='alpha'||key==='lumina');
    labelEl.textContent = (isSecretAttr && !rowAnySeen) ? '？？？' : label;
    row.appendChild(labelEl);
    const cells=document.createElement('div');
    cells.className='chara-collection-cells';
    for(let t=0;t<=7;t++){
      totalCount++;
      const seen = (key==='normal' && t===0) ? true : !!s.charaSeen[key+'_'+t];
      const cell=document.createElement('div');
      cell.className='chara-collection-cell'+(seen?'':' unseen');
      if(seen){
        seenCount++;
        const img=document.createElement('img');
        img.src=imgSet[t];
        img.title=label+' / Tier'+t;
        cell.appendChild(img);
      }
      cells.appendChild(cell);
    }
    row.appendChild(cells);
    grid.appendChild(row);
  });
  const _cct=document.getElementById('charaCollectionTotal'); if(_cct) _cct.textContent='観測済み: '+seenCount+' / '+totalCount;
  el.classList.add('open');
}
function hideCharaCollection(e){
  if(e && e.target!==document.getElementById('charaCollectionOverlay') && e.target!==document.getElementById('charaCollectionClose')) return;
  const el=document.getElementById('charaCollectionOverlay');
  if(el) el.classList.remove('open');
}

/* ===== マニュアル ===== */
function showManual(){
  const el=document.getElementById('manualOverlay');
  if(el) el.classList.add('open');
}
function hideManual(e){
  if(e && e.target!==document.getElementById('manualOverlay') && e.target!==document.getElementById('manualClose')) return;
  const el=document.getElementById('manualOverlay');
  if(el) el.classList.remove('open');
}

/* ===== オープニングイベント ===== */
function playOpening(){
  _logSlowMode=true;
  const seq=[
    {delay:0,    text:'情報海へ接続した',                                                                                  type:null},
    {delay:3000, text:'目の前に映るのは、キミのAI思念体。彼に情報領域を探索させて、様々な意味を発見していこう！',          type:'positive'},
    {delay:200,  text:'まずは、3つある概念パターンから、探索したい概念を2つ選んで、問いを観測させよう。新たな概念が見つかるはずだ。', type:'observe'},
  ];
  let step=0;
  function next(){
    if(step>=seq.length){
      _logSlowMode=false;
      localStorage.setItem('ib_v9_opening_done','1'); // 表示済みフラグ
      return;
    }
    const item=seq[step++];
    setTimeout(()=>{
      _logOnComplete=next;
      log(item.text, item.type);
    }, item.delay);
  }
  next();
}

let _tickInterval=null;
function startTick(){
  if(_tickInterval) return;
  _tickInterval=setInterval(tick, 1000);
}

function initTitleScreen(){
  const ts=document.getElementById('titleScreen');
  if(!ts) return;
  // 画像セット（全要素を安全にセット）
  const setImg=(id, src)=>{ const el=document.getElementById(id); if(el && src) el.src=src; };
  setImg('titleLogo',       typeof TITLE_IMG       !=='undefined' ? TITLE_IMG       : '');
  setImg('titlePressStart', typeof PRESS_START_IMG !=='undefined' ? PRESS_START_IMG : '');
  setImg('titleCopyright',  typeof COPYRIGHT_IMG   !=='undefined' ? COPYRIGHT_IMG   : '');
  setImg('titleSettingsBtn',typeof SETTINGS_IMG    !=='undefined' ? SETTINGS_IMG    : '');
  setImg('titleChara', TIRE_IMAGES[0]);
  setImg('makerLogoImg', typeof SWAMP_LOGO_IMG!=='undefined' ? SWAMP_LOGO_IMG : '');

  // タイトル画面はロゴの裏で最初から表示
  ts.style.opacity='1';
  ts.style.display='';
  ts.style.transition='none';

  // メーカーロゴ → タイトルのフロー
  const logoScreen=document.getElementById('makerLogoScreen');
  let _logoSkipped=false;

  function showTitle(){
    if(_logoSkipped) return;
    _logoSkipped=true;
    document.removeEventListener('keydown', skipLogo);
    document.removeEventListener('click', skipLogo);
    if(logoScreen){
      // ロゴ画像だけフェードアウト、白背景はそのまま維持してからdisplay:none
      const logoImg=document.getElementById('makerLogoImg');
      if(logoImg) logoImg.style.opacity='0';
      setTimeout(()=>{
        if(logoScreen) logoScreen.style.display='none';
        // タイトル画面BGM: track_2を再生
        if(typeof switchBgmTrack==='function') switchBgmTrack(2);
      }, 800);
    } else {
      if(typeof switchBgmTrack==='function') switchBgmTrack(2);
    }
  }
  function skipLogo(){
    if(_logoSkipped) return;
    showTitle();
  }

  if(logoScreen){
    // ロゴ画面（白背景）は即表示、ロゴ画像だけフェードイン
    logoScreen.style.display='flex';
    const logoImg=document.getElementById('makerLogoImg');
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        if(logoImg) logoImg.style.opacity='1';
      });
    });
    setTimeout(showTitle, 3800);
    document.addEventListener('keydown', skipLogo);
    document.addEventListener('click', skipLogo);
  } else {
    if(typeof switchBgmTrack==='function') switchBgmTrack(2);
  }

  // キー/クリックで解除
  function startGame(){
    // Safari対策: ユーザー操作との紐付けを保つため再生は先頭で行う
    const trackIdx = (typeof s !== 'undefined' && s.currentTrackIdx) ? s.currentTrackIdx : 0;
    if(typeof switchBgmTrack === 'function'){
      switchBgmTrack(trackIdx);
    } else {
      // fallback: track_0を直接再生
      const audio=document.getElementById('bgmAudio_0');
      if(audio && bgmAudioOn){
        audio.volume=0.4;
        if(audio.readyState===0) audio.load();
        audio.play().catch(err=>{
          setTimeout(()=>{ audio.play().catch(e2=>log('BGM再試行も失敗: '+(e2&&e2.name?e2.name:e2))); }, 500);
        });
      }
    }
    startTick(); // Press Start時にtick開始
    ts.style.transition='opacity .6s';
    ts.style.opacity='0';
    setTimeout(()=>{
      ts.style.display='none';
      if(_isFirstLaunch) playOpening();
      else log('情報海へ接続した');
    }, 600);
    document.removeEventListener('keydown', startGame);
    ts.removeEventListener('click', startGame);
  }
  // SETTINGSボタン（stopPropagationでstartGame発火を防ぐ）
  const _settingsBtn=document.getElementById('titleSettingsBtn');
  if(_settingsBtn){
    _settingsBtn.addEventListener('click', e=>{
      e.stopPropagation();
      showSettings();
    });
  }
  ts.addEventListener('click', startGame);
  document.addEventListener('keydown', startGame);
}

/* ===== セーブデータインポートボタン初期化 =====
   #titleScreenのdisplay変化をMutationObserverで監視し、
   タイトル画面表示中のみボタンを表示する。
   initTitleScreen()と独立して動作し、何度でも正しく機能する。 */
function initImportButton(){
  const btn=document.getElementById('titleImportBtn');
  const input=document.getElementById('titleImportInput');
  const hint=document.getElementById('titleImportHint');
  const ts=document.getElementById('titleScreen');
  if(!btn || !input || !ts) return;

  // titleScreenのdisplay変化を監視してボタン表示を連動
  function syncBtnVisibility(){
    const tsVisible = ts.style.display !== 'none' && ts.style.opacity !== '0';
    btn.style.display = tsVisible ? 'block' : 'none';
    if(!tsVisible && hint) hint.style.display='none';
  }
  const observer = new MutationObserver(syncBtnVisibility);
  observer.observe(ts, {attributes:true, attributeFilter:['style']});
  syncBtnVisibility(); // 初期状態を反映

  // ボタンクリック: ヒント表示→ファイル選択(タイトル画面には伝播させない)
  btn.addEventListener('click', e=>{
    e.stopPropagation();
    if(hint) hint.style.display='block';
    input.click();
  });

  // ファイル選択後のインポート処理
  input.addEventListener('change', e=>{
    if(hint) hint.style.display='none';
    const file=e.target.files[0];
    if(!file){ return; }
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(!data || typeof data!=='object' || !data.level){
          alert('セーブデータのフォーマットが正しくありません。');
          input.value=''; return;
        }
        if(!window.confirm('現在のセーブデータを上書きします。よろしいですか？')){
          input.value=''; return;
        }
        // localStorageに保存し、sを差し替えてrenderする
        localStorage.setItem('ib_v9', JSON.stringify(data));
        Object.assign(s, data);
        input.value='';
        render(); save();
        alert('セーブデータを読み込みました。\nPRESS STARTでゲームを開始してください。');
      }catch(err){
        alert('ファイルの読み込みに失敗しました: '+err.message);
      }
    };
    reader.readAsText(file);
  });
}

/* ===== セッティング画面 ===== */
function showSettings(){
  const ov=document.getElementById('settingsOverlay');
  if(ov) ov.style.display='flex';
}
function hideSettings(){
  const ov=document.getElementById('settingsOverlay');
  if(ov) ov.style.display='none';
}
function showCreditWindow(){
  const ov=document.getElementById('creditOverlay');
  if(ov) ov.style.display='flex';
}
function hideCreditWindow(e){
  if(e && e.target!==document.getElementById('creditOverlay')) return;
  const ov=document.getElementById('creditOverlay');
  if(ov) ov.style.display='none';
}
function initSettings(){
  const bgmSlider=document.getElementById('settingsBgmSlider');
  const bgmVal=document.getElementById('settingsBgmVal');
  if(bgmSlider) bgmSlider.addEventListener('input',()=>{
    const v=parseInt(bgmSlider.value);
    if(bgmVal) bgmVal.textContent=v;
    const vol=v/100;
    TRACKS.forEach(t=>{ const a=document.getElementById(t.audioId); if(a) a.volume=vol; });
  });
  const seSlider=document.getElementById('settingsSeSlider');
  const seVal=document.getElementById('settingsSeVal');
  if(seSlider) seSlider.addEventListener('input',()=>{
    const v=parseInt(seSlider.value);
    if(seVal) seVal.textContent=v;
    seVolume=v/100;
  });
  const closeBtn=document.getElementById('settingsCloseBtn');
  if(closeBtn) closeBtn.addEventListener('click',hideSettings);
  const creditBtn=document.getElementById('settingsCreditBtn');
  if(creditBtn) creditBtn.addEventListener('click',showCreditWindow);
  const resetBtn=document.getElementById('settingsResetBtn');
  if(resetBtn) resetBtn.addEventListener('click',()=>{
    if(!window.confirm('AI形態コレクションを含む全データを初期化します。よろしいですか？')) return;
    localStorage.removeItem('ib_v9');
    alert('初期化しました。ページを再読み込みします。');
    location.reload();
  });
  const importBtn=document.getElementById('settingsImportBtn');
  const importInput=document.getElementById('settingsImportInput');
  const importHint=document.getElementById('settingsImportHint');
  if(importBtn&&importInput){
    importBtn.addEventListener('click',e=>{
      e.stopPropagation();
      if(importHint) importHint.style.display='block';
      importInput.click();
    });
    importInput.addEventListener('change',e=>{
      if(importHint) importHint.style.display='none';
      const file=e.target.files[0];
      if(!file) return;
      const reader=new FileReader();
      reader.onload=ev=>{
        try{
          const data=JSON.parse(ev.target.result);
          if(!data||typeof data!=='object'||!data.level){ alert('セーブデータのフォーマットが正しくありません。'); importInput.value=''; return; }
          if(!window.confirm('現在のセーブデータを上書きします。よろしいですか？')){ importInput.value=''; return; }
          localStorage.setItem('ib_v9',JSON.stringify(data));
          Object.assign(s,data);
          importInput.value='';
          render(); save();
          hideSettings();
          alert('セーブデータを読み込みました。\nPRESS STARTでゲームを開始してください。');
        }catch(err){ alert('ファイルの読み込みに失敗しました: '+err.message); }
      };
      reader.readAsText(file);
    });
  }
}
