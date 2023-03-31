// File APIに対応しているか確認
if (window.File && window.FileReader && window.FileList && window.Blob) {

    var file, result, ids, ids_value;

    var c_GB = 0; //学籍番号
    var c_GS = 0; //学生氏名
    var c_SMK = 0; //進級(見込)区分名称 or 卒業(見込)区分名称
    var c_TSKM = 0; //単位識別区分名称
    var c_SKBR = 0; //成績用科目分類略称
    var c_KBT = 0; //科目分類毎単位
    var c_G = 0; //学年

    window.onload = function () {
        ids = document.getElementById('ids');
        file = document.getElementById('file1');
        result = document.getElementById('result');
        file.addEventListener('change', loadLocalCsv, false);
    }
    
    //CSV列タイトルから配列インデックスを取得する
    function getArrayIndex(arr) {
        let idx = [];
        c_SKBR = 0; //２回目を無視するため（ブラウザ残って０にならないケースがあった）
        outer:
        for (let i = 0; i < arr.length; i++) {
            switch(arr[i]) {
                case '学籍番号':
                    c_GB = idx.length;
                    idx.push(i);
                    break;
                case '学生氏名':
                    c_GS = idx.length;
                    idx.push(i);
                    break;
                case '進級見込区分名称':
                case '進級区分名称':
                case '卒業見込区分名称':
                case '卒業区分名称':
                    c_SMK = idx.length;
                    idx.push(i);
                    break;
                case '単位識別区分名称':
                    c_TSKM = idx.length;
                    idx.push(i);
                    break;
                case '成績用科目分類略称':
                    if (c_SKBR == 0) { //２回目を無視するため
                        c_SKBR = idx.length;
                        idx.push(i);
                    }
                    break;
                case '科目分類毎単位':
                    c_KBT = idx.length;
                    idx.push(i);
                    break;
                case '学年':
                    c_G = idx.length;
                    idx.push(i);
                    break;
            }
        }
        if (idx.length < 6) {
            alert('判定資料CSVが想定した形式ではないため処理できません。中断します。' + idx);
            return;
        }
        return idx;
    }

    //判定資料に「修得済」のみがあるか（＝「履修中」「合計」が含まているか）チェックする
    function isShutokuzumiOnly(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i][c_TSKM] == "履修中" || data[i][c_TSKM] == "合計") {
                return false;
            }
        }
        return true;
    }

    //判定資料の「合計」以外の行を削除する
    function cleanData(data) {
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i][c_TSKM] != "合計") {
                data.splice(i, 1);
            }
        }
        return data;
    }

    //判定資料を学籍番号順で並び替える（判定資料がコースごとになっているため）
    function sortData(data) {
        data.sort((a,b)=>{
            if (a[c_G] > b[c_G]) return -1;
            else if (a[c_G] < b[c_G]) return 1;
            if (a[c_GB] < b[c_GB]) return -1;
            else if (a[c_GB] > b[c_GB]) return 1;
            return 0;
        }); //学籍番号をキーに昇順に並び替える
        return data;
    }

    function makeRow(c, gb, gs, smk, g, a) {
        if (!g) g = "";
        if (!ids_value) {
            if (c == 1) {
                return makeRow_1(gb, gs, smk, g, a);
            } else {
                return makeRow_2(gb, gs, smk, g, a);
            }
        } else {
            if (ids_value.indexOf(gb) != -1) {
                if (c == 1) {
                    return makeRow_1(gb, gs, smk, g, a);
                } else {
                    return makeRow_2(gb, gs, smk, g, a);
                }
            } else {
                return "";
            }
        }
    }

    function h(v, c) { //vがcより小さい場合に色づけする
        return (v >= c) ? v : `<font style='color:red;'>${v}</font>` 
    }

    function hh(v, c) { //不可があったら色づけする
        if (!v) return v;
        if (v.indexOf('不可') != -1 || v.indexOf('留年') != -1) {
            return `<font style='color:red;'>${v}</font>`;
        }
        return v;
    }

    function makeRow_1(gb, gs, smk, g, a) { //新カリ用
        const t = ["学年", "判定", "学籍番号", "氏名", "合計≧118", "共通教養≧20", "外国語≧8", "専門", "人○", "人■≧2", "地■≧2", "課○", "課■", "ス■≧1", "外○", "外■≧4", "専○", "専■", "専△"];
        let r = "<tr style='font-size:50%;text-align:center;'>";
        for (let i = 0; i < t.length; i++) {
            r += `<td>${t[i]}</td>`;
        }
        r += "</tr><tr style='text-align:right;'>"
        r += `<td>${g}</td><td>${hh(smk)}</td><td style='text-align:center;'>${gb}</td><td style='text-align:left;'>${gs}</td><td>${h(a[0],118)}</td><td>${h(a[1],20)}</td><td>${h(a[12],8)}</td><td>${a[15]}</td><td>${a[3]}</td><td>${h(a[4],2)}</td><td>${h(a[6],2)}</td><td>${a[8]}</td><td>${h(a[9],1)}</td><td>${a[11]}</td><td>${a[13]}</td><td>${h(a[14],4)}</td><td>${a[16]}</td><td>${a[17]}</td><td>${a[18]}</td></tr>`;
        return r + "</tr>";
    }

    function makeRow_2(gb, gs, smk, g, a) { //旧カリ用
        const t = ["学年", "判定", "学籍番号", "氏名", "合計≧118", "共通教養5群含≧28", "5群", "専門", "1○", "1■≧2", "1△", "2■≧2", "2△", "3○", "3△", "4■≧1", "5○", "5■≧4", "5△", "専○", "専■", "専△"];
        let r = "<tr style='font-size:50%;text-align:center;'>";
        for (let i = 0; i < t.length; i++) {
            r += `<td>${t[i]}</td>`;
        }
        r += "</tr><tr style='text-align:right;'>"
        r += `<td>${g}</td><td>${hh(smk)}</td><td style='text-align:center;'>${gb}</td><td style='text-align:left;'>${gs}</td><td>${h(a[0],118)}</td><td>${h(Number(a[1])+Number(a[16]),28)}</td><td>${a[16]}</td><td>${a[22]}</td><td>${a[3]}</td><td>${h(a[4],2)}</td><td>${a[5]}</td><td>${h(a[9],2)}</td><td>${a[10]}</td><td>${a[12]}</td><td>${a[13]}</td><td>${h(a[15],1)}</td><td>${a[17]}</td><td>${h(a[18],4)}</td><td>${a[19]}</td><td>${a[23]}</td><td>${a[24]}</td><td>${a[25]}</td></tr>`;
        return r;
    }

    function createTable(data) {
        let r = "<table border=1>";
        let gb = ""; //学籍番号
        let gs = ""; //学生氏名
        let smk = ""; //進級判定 or 卒業判定
        let g = ""; //学年
        let c = 1; //カリキュラムフラグ（1:新カリ, 2:旧カリ）
        let a = [];
        for (let i = 0; i < data.length; i++) {
            if (gb == "" || data[i][c_GB] == gb) {
                a.push(data[i][c_KBT]);
                if (data[i][c_SKBR].indexOf('群') != -1) c = 2; //旧カリだ
            } else {
                r += makeRow(c, gb, gs, smk, g, a);
                a = [];
                a.push(data[i][c_KBT]);
                c = 1;
            }
            gb = data[i][c_GB];
            gs = data[i][c_GS];
            smk = data[i][c_SMK];
            g = data[i][c_G];
        }
        r += makeRow(c, gb, gs, smk, g, a);
        return r + "</table>";
    }

    function loadLocalCsv(e) {
        if (!ids.value) {
            ids_value = ids.value;
        } else {
            ids_value = [];
            let a = ids.value.split('\n');
            for (let i = 0; i < a.length; i++) {
                ids_value.push(a[i].substring(0, 10));
            }
        }
        
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

            //タイトル行を削除する
            data.shift();

            //「修得済み」以外を含むCSVなら不要なデータ行を削除する
            if (isShutokuzumiOnly(data) == false) {
                data = cleanData(data);
            }

            //学籍番号でソートする
            data = sortData(data);

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
