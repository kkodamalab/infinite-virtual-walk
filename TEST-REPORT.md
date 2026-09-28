# 検証記録

2026-09-28 / Windows / Codex内蔵Chromium 153。未確認の項目は合格扱いにしません。

## 自動テスト

`node --test tests/core.test.mjs`: **16 / 16 PASS**。

- Phase 1: IoU、同一物体のID維持、一対一対応、カテゴリー分離、消失後再検出、プライバシー検索制限。
- Phase 2: 時刻・大きさ・移動の補間、近似類似度の範囲・欠損処理。
- Phase 3: 6モードのシード再現、ランダムの前回回避、候補0/1件・全除外、収束／発散の単調性・端点、テーマ代替、周期、置換0/100%。
- Phase 4: 4自動FXモード、入力非破壊、連動の終点、プリセットの独立性。
- Phase 5: 設定境界、JSONラウンドトリップ、不正URL・時刻・スキーマ拒否。

`node scripts/build.mjs`: **成功**。`node --check src/app.js`: **成功**。

## ブラウザーで確認した項目

`tests/browser.html`の結果:

- WebGLでNEGATIVE、MOSAIC、THRESHOLD、EDGE、RGB SHIFTが実ピクセルを変化させる: PASS。
- ECHOが前フレームを保持: PASS。
- 6エフェクト同時適用: PASS。
- IndexedDBの設定＋Blob往復: PASS。
- 実MediaPipeモデルのWorker初期化と同梱バス画像での推論: PASS。
- 上記1枚の出力: bus 0.9328 / bicycle 0.5518 / person 0.4712。精度評価用データセットでの測定ではありません。

アプリ画面で、デモ起動、再生時刻の進行、一時停止、NEXT WORLD、ALL ON/OFF、SAVE WORLD、保存済みプロジェクトの復元を確認。狭幅表示で横スクロールなし。ネット検索はCommonsへの実HTTP要求と40枚のライセンス付き同梱画像取得を確認。

追加仕様のブラウザー確認として、CAPTURE画面にCAMERA / LOCAL VIDEO / ONLINE VIDEOタブが表示されること、Commons APIの実検索で動画以外を除外し、WebMカードにタイトル・サイズ・mime・ライセンス・作者・出典を表示することを確認。Shibuya Crossing, Tokyo, Japan (video).webm（CC BY-SA 4.0 / Basile Morin）を選択し、アプリ内プレビュー、シークバー、解析区間、ANALYZE & RECONSTRUCTボタンが有効になることを確認しました。実動画の解析完了とGitHub Pages上での確認は、push前のため未検証です。

## 未検証・制約

実カメラの起動・停止、実機録画、広角レンズ、カメラ権限拒否後の実ファイル読込、GPS、姿勢、実際の歩行動画全体の追跡、iPhone Safari、長時間の周回切替、1920×1080/30fps、プロジェクター出力は未検証です。ブラウザーのUI確認を実機検証の代わりに扱いません。検出精度・検索品質・1080pの性能は合格と断定していません。

既知の機能制約はREADME参照。自動テスト中に見つけたMediaPipeのCDNバージョン不一致とmodule Worker内のimportScripts非対応は修正し、実モデルで再検証しました。
