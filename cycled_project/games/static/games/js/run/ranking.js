import { createPopupWindow } from './drawWindow.js';

export default class RankingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RankingScene' });
        this.isReady = false;
    }

    create() {
        // 戻るボタン
        this.backButton = this.add.sprite(100, 80, 'inputPrompts', 608);  // (x, y, key, frame)
        // ボタンにインタラクションを追加（クリックイベント）
        this.backButton
            .setDisplaySize(48 *3/2, 48)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                const sound = this.sound.add('buttonSoftSound',{volume: 1.2});
                sound.play();
            })
            .setFlipX(true)  // 水平方向に反転
            .on('pointerdown', this.goBackScene.bind(this))
            // ホバー時の色変更（マウスオーバー）
            .on('pointerover', () => {
                this.backButton.setTint(0x44ff44);  // ホバー時に緑色に変更
            })
            // ホバーを外した時の色を戻す（マウスアウト）
            .on('pointerout', () => {
                this.backButton.clearTint();  // 色を元に戻す
            });

        const { width, height } = this.scale;
        this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
            .setScrollFactor(0)
            .setDepth(-1);
        this.createDisplay();
        // this.getScores();
        // this.showConfirmPopup();
        this.isReady = true;
    }

    preBackScene() {
        // 非表示にする
        this.overlay.setVisible(false);  // オーバーレイを非表示にする
        this.panel.setVisible(false);
        this.scoreTitle.setVisible(false);
        this.notyetText.setVisible(false); 
        this.backButton.setVisible(false);
    }
    goBackScene() {
        // previousSceneを取得
        const previousSceneKey = this.scene.get('RankingScene').data.get('previousScene') || 'StartScene';        
        const previousScene = this.scene.get(previousSceneKey);
        this.preBackScene();    //戻る前に色々非表示にする
        previousScene.onBringToTop()?.();   //戻る前に実行したい関数があれば実行
        this.scene.bringToTop(previousSceneKey);
    }

    onBringToTop() {
        if (!this.isReady)  return;

        this.overlay.setVisible(true);
        this.panel.setVisible(true);
        this.scoreTitle.setVisible(true);
        // this.notyetText.setVisible(true); 
        this.backButton.setVisible(true);

        // 一瞬まつ(panelを取得できるように)
        this.time.delayedCall(10, () => {
            const now = Date.now();
            const THRESHOLD_MS = 30 * 1000;  // 30秒以内なら再取得しない
            if ((now - this.lastGetScoresTime) < THRESHOLD_MS && this.preScores) {
                this.showDisplayScores(this.preScores);
            } else {
                this.getScores();
            }
        });
    }
    
    getScores() {
        var scene = this;
        $.ajax({
            url: '/games/api/nikirun_score/',
            method: 'GET',
            headers: {
                "X-CSRFToken": getCookie('csrftoken')  // CSRFトークンをヘッダーに設定
            },
            success: (scores) => {
                // スコアをランキングに表示する処理
                this.preScores = scores;
                this.lastGetScoresTime = Date.now();  // ← 時刻更新
                this.showDisplayScores(scores);
            },
            error: function(xhr, status, error) {
                let msg;
                switch (xhr.status) {
                    case 400:
                        const res = xhr.responseJSON;
                        if (res && res.score) {
                            msg = 'スコアに関するエラー: ' + res.score.join(', ');
                        } else {
                            msg = 'リクエストに問題があります: ' + JSON.stringify(res);
                        }
                        break;
                    case 401:
                        msg = '認証が必要です。ログインしてください。';
                        break;
                    case 403:
                        msg = 'アクセスが拒否されました。権限がありません。';
                        break;
                    case 404:
                        msg = 'スコアデータが見つかりませんでした。';
                        break;
                    case 500:
                        msg = 'サーバー内部でエラーが発生しました。';
                        break;
                    default:
                        msg = `不明なエラーが発生しました\n（ステータスコード: ${xhr.status} ）`;
                }
                const popup = createPopupWindow(scene, {
                    x: scene.game.config.width / 2,  // 画面の中央X座標
                    y: scene.game.config.height / 2, // 画面の中央Y座標
                    width: scene.game.config.height * 2/3 * 1.618,
                    height: scene.game.config.height * 2/3,
                    header: 'Error',
                    message: msg ,
                });
            },
        });
    }

    // スコア表示用のメソッド
    createDisplay() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
    
        // テキストの位置を設定
        this.scoreTitle = this.add.text(
            centerX, 90, 
            'Ranking', {
            fontFamily: 'DTM-Sans',
            fontSize: '96px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // まだ投稿されてないメッセージ
        this.notyetText = this.add.text(
            centerX, centerY, 
            'No scores yet!', {
            fontFamily: 'DTM-Sans',
            fontSize: '48px',
            color: '#ffcccc',
            align: 'center'
        }).setOrigin(0.5).setDepth(1).setVisible(false);
    
        // スクロールパネル作成
        this.panel = this.rexUI.add.scrollablePanel({
            x: centerX,
            y: centerY + 50,
            width: this.scale.width - 200,
            height: centerY + 100,
        
            scrollMode: 0, // 0=vertical
        
            background: this.add.container(0, 0, [
                this.add.rectangle(0, 0, this.scale.width - 200, centerY + 100, 0x000000),  // 黒背景追加
                this.rexUI.add.ninePatch2({
                    width: this.scale.width - 200,
                    height: centerY + 100,
                    key: 'rankingWindowTile',
                    columns: [16, undefined, 16],
                    rows: [16, undefined, 16],
                    stretchMode: {
                        edge: 'repeat',
                        internal: 'scale'
                    }
                })
            ]),            
        
            panel: {
                child: this.rexUI.add.fixWidthSizer({
                    space: { top: 10, bottom: 10, left: 10, right: 10, item: 10 },
                }),
            },
        
            slider: {
                track: this.add.rectangle(0, 0, 20, 10, 0x555555),
                thumb: this.add.rectangle(0, 0, 20, 40, 0xffffff),
            },
        
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },
        
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                panel: 10,
            }
        })        
        .layout();

        if (!this.isReady)  this.getScores();   //displayがちゃんと完成してから実行
    }

    showDisplayScores(scores) {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        this.panel.setVisible(true);
        this.scoreTitle.setVisible(true);
        this.sizer = this.panel.getElement('panel');  // FixWidthSizer
        // 中身を削除（子オブジェクトも破棄される）
        this.sizer.clear(true);  // true を指定すると PhaserのGameObjectも一緒に destroy される

        this.panel.setVisible(true);
        if (scores.length === 0) {
            this.panel.getElement('slider.track').setVisible(false);
            this.panel.getElement('slider.thumb').setVisible(false);
            this.notyetText.setVisible(true);
            return;
        }

        // スコアリストを作成
        scores.forEach((scoreData, index) => {
            let rankColor;
            switch (index) {
                case 0: rankColor = '#ffd700'; break;   // 金
                case 1: rankColor = '#c0c0c0'; break;   // 銀
                case 2: rankColor = '#cd7f32'; break;   // 銅
                default: rankColor = '#ffffff'; break;  // 白
            }            
            const rowHeight = 64;
            const rowWidth = this.panel.width - 80;

            // 1行分のSizerを作る
            const row = this.rexUI.add.sizer({
                orientation: 'horizontal',
                space: { top: 10, bottom: 10, left: 20, item: 30 },
                width: rowWidth,   // ちょっと余裕を持たせる
                height: rowHeight + 20,  // spaceで上下10ずつ取っているので行の高さより少し大きめに
            });

            // 順位
            let rankDisplay = ordinalSuffix(index + 1);
            const rankText = this.add.text(0, 0, rankDisplay, {
                fontFamily: 'DTM-Sans',
                fontSize: '48px',
                color: rankColor,
            }).setOrigin(0.5);

            // アイコン
            const chara = scoreData.character;
            const avatar = this.add.sprite(0, 0, chara + 'Run', 0)
                .setDisplaySize(64, 64)
                .play(chara + 'Run')
                .setOrigin(0.5);

            // 名前
            const username = this.add.text(0, 0, scoreData.user, {
                fontFamily: 'JF-Dot-K14',
                fontSize: '48px',
                color: '#ffffcc'
            }).setOrigin(0.5);

            // スコア
            let scoreDisplay = strScore(scoreData.score);
            const scoreLabel = this.add.text(0, 0, scoreDisplay, {
                fontFamily: 'DTM-Sans',
                fontSize: '48px',
                color: '#ffcc99',
                align: 'right'
            }).setOrigin(0.5);
            
            // 更新日時
            const updatedAt = this.add.text(0, 0, scoreData.updated_at || 'N/A', {
                fontFamily: 'DTM-Sans',
                fontSize: '48px',
                color: '#cccccc'
            }).setOrigin(0.5);

            // rowにパーツを追加
            row.add(rankText, 0, 'center');
            row.add(avatar, 0, 'center');  // avatarにのみx軸マージンを追加
            row.add(username, 0, 'center');
            row.add(this.rexUI.add.space(), 1);
            row.add(scoreLabel, 0, 'center');  // ← scoreLabelだけ伸びる (proportion:1)
            // ★ スペーサーを追加（右側に押し出す）
            row.add(this.rexUI.add.space(), 1);  // proportion: 1
            row.add(updatedAt, 0, 'right');

            // 全体のsizerに追加
            this.sizer.add(row, 0, 'left', 0, true);

            // ボーダーの幅と高さ
            const borderWidth = rowWidth;
            const borderHeight = 2;

            // Rectangleを使ってボーダーを作成
            const borderLine = this.add.rectangle(0, 0, borderWidth, borderHeight, 0xffffff)
                .setOrigin(0);  // 左上を基準に

            // borderLine をラップする Sizer を作成（オプション、安定性のため）
            const borderSizer = this.rexUI.add.sizer({
                orientation: 'vertical',
                width: borderWidth,
                height: borderHeight,
            });

            borderSizer.add(borderLine, 0, 'center');

            // rowの下に追加
            this.sizer.add(borderSizer, 0, 'left', 0, true);

        });

        // スライダー調整
        const itemHeight = 50; // 1項目あたりの高さ（だいたい）
        const visibleItemCount = Math.floor((centerY + 100 - 20) / itemHeight); // パネル内に収まるアイテム数

        if (scores.length <= visibleItemCount) {
            // 項目数が少ない → スライダー非表示
            this.panel.getElement('slider.track').setVisible(false);
            this.panel.getElement('slider.thumb').setVisible(false);
        } else {
            // 項目数が多い → スライダーをリストに合わせて調整（オプションで）
            const thumb = this.panel.getElement('slider.thumb');
            let thumbHeightRatio = visibleItemCount / scores.length;
            thumb.setDisplaySize(20, Math.max(40, (centerY + 100) * thumbHeightRatio));
        }

        // パネルを再レイアウト
        this.panel.layout();
    }
}

function strScore(score) {
    let scoreDisplay;
    if (score > 1000000) {
        scoreDisplay = (score / 1000).toFixed(0) + ' km';
    } else if (score > 1000) {
        scoreDisplay = (score / 1000).toPrecision(3) + ' km';
    } else {
        scoreDisplay = score.toPrecision(3) + ' m';
    }
    return scoreDisplay;
}
function ordinalSuffix(i) {
    const j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return i + "st.";
    if (j == 2 && k != 12) return i + "nd.";
    if (j == 3 && k != 13) return i + "rd.";
    return i + "th.";
}