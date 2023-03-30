// File APIに対応しているか確認
if (window.File && window.FileReader && window.FileList && window.Blob) {

    let file, result;

    let c_GB = 0; //学籍番号
    let c_GS = 1; //学生氏名
    let c_TSKM = 2; //単位識別区分名称
    let c_SKBR = 3; //成績用科目分類略称
    let c_KBT = 4; //科目分類毎単位

    window.onload = function () {
        file = document.getElementById('file1');
        result = document.getElementById('result');
        file.addEventListener('change', loadLocalCsv, false);
    }
    
    //CSV列タイトルから配列インデックスを取得する
    function getArrayIndex(arr) {
        let idx = [];
        outer:
        for (let i = 0; i < arr.length; i++) {
            switch(arr[i]) {
                case '学籍番号':
                case '学生氏名':
                case '単位識別区分名称':
                case '成績用科目分類略称':
                case '科目分類毎単位':
                    idx.push(i);
                    if (idx.length >= 5) break outer;
                    break;
            }
        }
        if (idx.length != 5) {
            alert('判定資料CSVが想定した形式ではないため処理できません。中断します。');
            return;
        }
        return idx;
    }

    //判定資料に「修得済」のみがあるか（＝「履修中」「合計」が含まているか）チェックする
    function isShutokuzumiOnly(data) {
        for (let i = 1; i < data.length; i++) {
            if (data[i][c_TSKM] == "履修中" || data[i][c_TSKM] == "合計") {
                return false;
            }
        }
        return true;
    }

    //判定資料のタイトル行と「合計」以外の行を削除する
    function cleanData(data) {
        data.shift(); //タイトル行を削除する
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i][c_TSKM] != "合計") {
                data.splice(i, 1);
            }
        }
        return data;
    }

    function makeRow(c, gb, gs, a) {
        if (c == 1) {
            return makeRow_1(gb, gs, a);
        } else {
            return makeRow_2(gb, gs, a);
        }
    }

    function h(v, c) { //vがcより小さい場合に色づけする
        return (v >= c) ? v : `<font style='color:red;'>${v}</font>` 
    }

    function makeRow_1(gb, gs, a) { //新カリ用
        const t = ["学籍番号", "氏名", "合計", "共通教養", "外国語", "専門", "人○", "人■", "地■", "課○", "課■", "ス■", "外○", "外■", "専○", "専■", "専△"];
        let r = "<tr style='font-size:50%;text-align:center;'>";
        for (let i = 0; i < t.length; i++) {
            r += `<td>${t[i]}</td>`;
        }
        r += "</tr><tr style='text-align:right;'>"
        r += `<td style='text-align:center;'>${gb}</td><td style='text-align:left;'>${gs}</td><td>${h(a[0],124)}</td><td>${h(a[1],20)}</td><td>${h(a[12],8)}</td><td>${a[15]}</td><td>${a[3]}</td><td>${h(a[4],2)}</td><td>${h(a[6],2)}</td><td>${a[8]}</td><td>${h(a[9],1)}</td><td>${a[11]}</td><td>${a[13]}</td><td>${h(a[14],4)}</td><td>${a[16]}</td><td>${a[17]}</td><td>${a[18]}</td></tr>`;
        return r + "</tr>";
    }

    function makeRow_2(gb, gs, a) { //旧カリ用
        const t = ["学籍番号", "氏名", "合計", "共通教養5群含む", "5群", "専門", "1○", "1■", "1△", "2■", "2△", "3○", "3△", "4■", "5○", "5■", "5△", "専○", "専■", "専△"];;
        let r = "<tr style='font-size:50%;text-align:center;'>";
        for (let i = 0; i < t.length; i++) {
            r += `<td>${t[i]}</td>`;
        }
        r += "</tr><tr style='text-align:right;'>"
        r += `<td style='text-align:center;'>${gb}</td><td style='text-align:left;'>${gs}</td><td>${h(a[0],124)}</td><td>${h(Number(a[1])+Number(a[16]),28)}</td><td>${a[16]}</td><td>${a[22]}</td><td>${a[3]}</td><td>${h(a[4],2)}</td><td>${a[5]}</td><td>${h(a[9],2)}</td><td>${a[10]}</td><td>${a[12]}</td><td>${a[13]}</td><td>${h(a[15],1)}</td><td>${a[17]}</td><td>${h(a[18],4)}</td><td>${a[19]}</td><td>${a[23]}</td><td>${a[24]}</td><td>${a[25]}</td></tr>`;
        return r;
    }

    function createTable(data) {
        let r = "<table border=1>";
        let gb = ""; //学籍番号
        let gs = ""; //学生氏名
        let c = 1; //カリキュラムフラグ（1:新カリ, 2:旧カリ）
        let a = [];
        for (let i = 0; i < data.length; i++) {
            if (gb == "" || data[i][c_GB] == gb) {
                a.push(data[i][c_KBT]);
                if (data[i][c_SKBR].indexOf('群') != -1) c = 2; //旧カリだ
            } else {
                r += makeRow(c, gb, gs, a);
                a = [];
                a.push(data[i][c_KBT]);
                c = 1;
            }
            gb = data[i][c_GB];
            gs = data[i][c_GS];
        }
        r += makeRow(c, gb, gs, a);
        return r + "</table>";
    }

    function loadLocalCsv(e) {
        // ファイル情報を取得
        let fileData = e.target.files[0];

        // CSVファイル以外は処理を止める
        if (!fileData.name.match('.csv$')) {
            alert('CSVファイルを選択してください');
            return;
        }

        // FileReaderオブジェクトを使ってファイル読み込み
        let reader = new FileReader();
        // ファイル読み込みに成功したときの処理
        reader.onload = function () {
            let rows = reader.result.replaceAll("\"","").split('\n');

            //CSVデータから列番号を取得する（CSVフォーマットが複数あるため柔軟に対応するため）
            let col_idx = getArrayIndex(rows[0].split(','));

            //必要な列だけ抜き取ってdataを生成する
            let data = [];
            for (let i = 1; i < rows.length; i++) {
                let a = rows[i].split(',');
                let b = [];
                for (let j = 0; j < col_idx.length; j++) {
                    b.push(a[col_idx[j]]);
                }
                data.push(b)
            }

            //「修得済み」以外を含むCSVなら不要なデータ行を削除する
            if (isShutokuzumiOnly(data) == false) {
                data = cleanData(data);
            }

            //HTML生成
            let str = createTable(data);
            result.innerHTML = str

            //次の入力のためファイル名を消去する
            document.getElementById("file1").value = "";
        }
        // ファイル読み込みを実行（CSVファイルがSJISなので指定して読み込む必要がある）
        reader.readAsText(fileData, 'Shift_JIS');
    }

} else {
    file.style.display = 'none';
    result.innerHTML = 'File APIに対応したブラウザでご確認ください';
}
