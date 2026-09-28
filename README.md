# INFINITE VIRTUAL WALK

**Reality Reconstruction / Generative Urban Experience**

スマートフォンで記録した散歩の時刻・位置・大きさを骨格として、画像の組み合わせを周回ごとに変えるメディアアート作品。JavaScript ES Modules、Canvas 2D、WebGL、MediaRecorder、IndexedDBを使用します。課金APIやアカウント登録なしでデモを上映できます。

- Repository: https://github.com/kkodamalab/infinite-virtual-walk
- GitHub Pages: https://kkodamalab.github.io/infinite-virtual-walk/
- リリースの検証状況: [TEST-REPORT.md](TEST-REPORT.md)
- 画像クレジット: [public/IMAGE-CREDITS.md](public/IMAGE-CREDITS.md)

## 使い方

1. 初回は40枚の同梱写真、4物体、120秒の**合成軌跡**によるデモが開きます。撮影した東京の散歩やAI検出結果ではありません。
2. EXHIBITION → START で上映。NEXT WORLD は再生位置を保ったまま次の画像セットに変更します。
3. CAPTURE → カメラ起動 → RECORD。30 / 60 / 120 / 300秒を選択できます。動画ファイルを選ぶ方法も利用できます。音声は記録しません。
4. 動画を解析すると、モデルをダウンロード後、Web Worker内で端末内検出を行います。初回にはネット接続が必要です。
5. IMAGE ARCHIVEでCommonsを検索し、候補をクリックして適用。除外、カテゴリー変更、手動画像追加、テーマ付けができます。
6. SAVE WORLDは画像ID、シード、設定、周回、再生位置を保存。「保存したワールド・プリセット・プロジェクト」から復元できます。

CAPTUREにはCAMERA / LOCAL VIDEO / ONLINE VIDEOタブがあります。ONLINE VIDEOはCommonsの動画ファイルだけを検索し、WebM/MP4以外や画像結果を除外します。カードで動画をプレビューしてから解析区間、開始位置、解析頻度を指定し、ANALYZE & RECONSTRUCTを実行してください。解析は既存のMediaPipe Workerと追跡エンジンを再利用し、最大10件のCommons画像候補をIMAGE ARCHIVEへ登録します。検索結果はタイトルだけで歩行視点と断定せず、作者・ライセンス・出典とともに表示します。

オンライン動画は、再生できてもCanvas解析時にCORSまたはコーデック制限で失敗する場合があります。アプリはエラーを表示して停止し、提供元の利用条件が許す場合はユーザーが手動でダウンロードしてLOCAL VIDEOから再試行できます。CORSを回避するプロキシは実装していません。DEMO VIDEO LIBRARYには検索で実際に選択した素材だけを端末内に表示し、架空URLは登録しません。

Space: 再生/一時停止、N: 次の世界、R: リセット、F: 全画面、H: UI表示切替。入力フォームにフォーカスがある間はショートカットを停止します。HIDE UI時も右下のSHOW UIで復帰できます。Fullscreen API非対応ではUI非表示にフォールバックします。

PARALLELは左右に現実・仮想を縮小表示、SPLITは同一画角を中央で分割、MIRRORは仮想を左右反転、SWITCHは8秒ごとにMIRROR / PARALLELを切り替えます。REALは元映像のみ。**REALとVIRTUALは1本の動画・1つの再生時刻を共有**します。周回間隔と動画長が異なる場合は時間を伸縮します。極端な動画長の比率ではブラウザーの再生速度制限により再生できない場合があります。

## 独立した5つのエンジン

| モジュール | 実装 | 役割 |
|---|---|---|
| Capture | `src/capture.js` | カメラ、録画、GPS、姿勢 |
| Recognition | `src/recognition.js`, `src/recognition-worker.js` | モデル読込、フレーム抽出、IoU追跡 |
| Image Search | `src/search.js` | プロバイダー境界、特徴量、類似度 |
| Reconstruction | `src/renderer.js`, `src/core.js` | 軌跡補間、選択、コラージュ、トランジション |
| Visual Effect | `src/effects.js` | GPUシェーダー、CPUフォールバック |

選択・追跡・設定検証はDOM非依存です。描画を差し替えて3D化でき、検索プロバイダーは`search(track, keyword, signal)`で交換できます。

## 認識とプライバシー

MediaPipe Tasks Vision **0.10.21**、**EfficientDet-Lite0 float32 v1**を使用。検出閾値0.45、最大20件。COCO 80分類の信号機・バス・車・自転車・犬・猫などに対応します。建物、一般の看板、店舗は手動指定で補完します。OCR、ランドマーク識別、CLIPは未実装です。対応していない分類を自動検出したとは表示しません。

追跡はカテゴリーとIoUの一対一対応です。交差、高速移動、長い遮蔽ではIDが分かれます。代表画像は端末内JPEG。撮影中解析はオプションで、1回の解析が800msを超えると撮影後解析を案内します。GPSと姿勢は個別許可後に取得。カメラ停止・センサー停止・ページ終了で停止します。

撮影動画・切り抜き・GPSをサーバーに送信する機能はありません。外部通信は静的サイト、フォント、モデル配信、カテゴリー文字列によるCommons検索、候補画像取得です。人物・顔・ナンバープレートに関するカテゴリー／検索語を拒否します。これは顔やナンバーを自動ぼかしする機能ではありません。元映像や手動画像の展示判断は利用者が行ってください。

## 画像検索API・費用・ライセンス

標準は**Wikimedia Commons Action API**。キー不要、アプリ側の従量課金なし。1物体につき最大12件を要求し、少ない場合は取得件数で動きます。連続する物体は逐次検索し500ms間隔を設けます。サービス側の制限や障害時にはデモ／手動画像を使用できます。

APIから画像URL、出典URL、作者、ライセンス名・URL、取得日時を保持します。不明な権利情報は警告表示。同梱画像はCC BY、CC BY-SA、CC0またはPublic Domainを選択し、元の条件・作者・出典をクレジットに記載。クロップ・エフェクトは改変です。CC BY-SAの継承など各画像の条件を公開展示前に確認してください。APIのメタデータだけで肖像権・商標権等まで保証されるものではありません。

ネット画像のバイナリは永続キャッシュしません（ブラウザーの通常HTTPキャッシュを除く）。IndexedDBにはURLとメタデータを保存します。手動追加画像はJPEG化して端末内保存。類似度は**色ヒストグラム70%＋輪郭量15%＋縦横比15%**の近似です。カテゴリーは検索で絞り込みますが、意味・撮影角度・同一の建物の判定は行いません。比較元がない候補は「未評価」と表示します。

調査した代替はUnsplash API。キー管理、作者・Unsplashへの帰属表示、ホットリンク、ダウンロード通知等のAPI固有要件があり、今回の実装では使用しません。料金や契約を開始していません。

公式資料（2026-09-28確認）:

- [MediaPipe Web Object Detector](https://developers.google.com/edge/mediapipe/solutions/vision/object_detector/web_js)
- [Commons API](https://commons.wikimedia.org/wiki/Commons:API/MediaWiki)
- [Commonsの再利用条件](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia)
- [MediaWiki API etiquette](https://www.mediawiki.org/wiki/API:Etiquette)
- [Unsplash API documentation](https://unsplash.com/documentation) / [API terms](https://unsplash.com/api-terms)
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

有料検索やクラウドAIは未接続です。将来、それらの契約・キー設定を行うとサービス側の従量料金が発生する場合があります。Workersはプラン・上限に依存します。**有料プランへの登録や外部サービスのデプロイは実施しません。**

## キーが必要なAPIへの拡張

フロントエンドへ秘密を置かないでください。`.env.example`はサーバー設定の説明用です。今回の標準検索に環境変数は不要です。

将来のWorker実装では以下を満たしてください。

1. `wrangler secret put IMAGE_API_KEY`でWorker内だけに保存。
2. 認証、レート制限、固定された検索API宛先、許可Originを設定。CORSだけを認証とみなさない。
3. クライアントからはカテゴリー文字列のみ受け取り、`src/search.js`と同じ候補メタデータを返す。任意URLを中継するプロキシを作らない。
4. プロバイダー固有の帰属表示・ホットリンク・ダウンロード通知・保存条件を実装する。
5. 画像をクラウド推論へ送る場合は送信前に、宛先・目的・対象画像を説明する明示的同意UIを追加する。

今回、キー付き検索プロバイダー／Worker本体は未実装です。未設定でも全デモ機能を利用できます。

## モードとエフェクト

RANDOMは直前の画像を可能な限り避けます。CONVERGENCE / DIVERGENCEは初期6周で類似度順を上昇／下降。EVOLUTIONはユーザーが付けたテーマを使用し、対応候補がなければ未分類から代替。OSCILLATIONは周期的に往復。MUTATIONは物体ごとに指定確率で置換するため、少数物体の実際の置換率は設定値と一致しない場合があります。

GPUの固定順序: **MOSAIC → NEGATIVE → THRESHOLD → EDGE → RGB SHIFT → ECHO**。REAL / VIRTUAL / 両方 / 物体のみへの適用、MANUAL / CYCLE / CONVERGE / RANDOM、変化速度、再構築との連動を設定できます。RANDOMの範囲は各スライダーの設定値以下。NEGATIVE 50%は原理上すべての色を中間グレーへ近づけます。

CUT / FADE / SPATIALを搭載。SPATIALはバウンディングボックス面積の小さい順を遠景と近似します。候補画像は選択前に読み込みます。輪郭セグメンテーションは行わず矩形クロップ。ORIGINAL背景では矩形で元の物体を遮蔽しますが、枠外の物体・影は残ります。

## 保存形式

IndexedDB `infinite-virtual-walk/data` にproject、video（Blob）、settings、presetsを保存。動画は最後に読み込んだ1本です。JSON version 1は軌跡、代表画像、候補、特徴量、類似度、設定、シード、ワールドを含み、**動画バイナリは含みません**。別端末へ移す際は動画も別ファイルで管理してください。元動画がないJSONも人工背景で上映できます。ブラウザーのサイトデータ削除、プライベートモード、OSの容量整理によってデータが消えることがあります。

## 開発・GitHub Pages

Node.js 22以上。パッケージインストールは不要です。

```sh
npm test
npm run dev
# http://127.0.0.1:4173
npm run build
```

`dist/`は静的公開用。相対URLなのでGitHub Pagesのサブパスに対応。Actions方式は`.github/workflows/pages.yml`を使用し、Settings → Pages → SourceをGitHub Actionsに設定します。ブラウザーから公開する場合は同じ静的ファイルを公開ブランチへ置き、PagesのDeploy from a branchを選択する方法も利用できます。

`tests/browser.html`でピクセル変化、残像、IndexedDBのブラウザーテストと実モデルの動作確認ができます。`scripts/fetch-demo.mjs`は同梱画像の再取得用。再実行すると検索結果が変化するため、通常のビルドでは実行しません。

## 既知の制約・今後

- iPhone Safari、実カメラ・GPS・姿勢、長時間上映、1080p/30fpsは実機で未検証。FPS表示で展示機ごとに確認してください。
- 手動分類が必要な建物・店舗・看板、CLIP、OCR、固有建物認識、輪郭切り抜き、3D、長期再識別は将来の拡張。
- 候補画像の内容の適合性・検出精度・類似度の知覚的妥当性は保証せず、手動選択で調整できます。
- 大量物体の解析・候補読込・保存はメモリーを消費します。まず短い動画、640px〜960px、0.5〜1fps解析で確認してください。
- WebGL非対応のCPU処理は最大640px。サイト自体の完全オフライン初回起動・PWAインストールは未実装です。同梱デモは検索API・モデルなしで動きます。
- モデル／APIの配信停止やCORS変更で認識・検索が利用できなくなる場合があります。エラーを表示し、手動指定とデモを継続できます。

コードを改変・公開する場合も、同梱画像の個別ライセンス・クレジットを維持してください。
