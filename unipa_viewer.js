// File APIに対応しているか確認
if (window.File && window.FileReader && window.FileList && window.Blob) {

    let file, result, class_id, class_date, class_period;

    window.onload = function () {
        file = document.getElementById('file1');
        result = document.getElementById('result');
        file.addEventListener('change', loadLocalCsv, false);
    }
    
    function createStr(data) {
        let r = "";

        data.shift(); //先頭のタイトル行を削除する
        data.sort((a,b)=>{if(a[2]<b[2]) return -1; else return 1; return 0;}) //学籍番号をキーに昇順に並び替える

        for (var i = 0; i < data.length -1; i++) {
//            console.log(i + " : " + data[i].length);
            if (data[i].length <= 1) continue; //Firefoxのソートだと空行が先頭に来るのでそれを無視するための文(2020/6/1)
            r += class_id.value + ","
            r += data[i][2].substring(0, 10) + ","
            r += class_date.value.replace(/-/g, '/') + ","
            r += class_period.value + ","
            if (data[i][4] == '未完了') {
                r += "3," //欠席
            } else {
                r += "0," //出席
            }

            //出席管理には必要ないがCSVに成績も入れるようにした(2020/5/14)
            r += "," + data[i][3] //,,を２個入れているのはユニパでの出席理由説明を飛ばすため

            r += "\n"
        }
        return r
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
            let cols = reader.result.split('\n');
            let data = [];
            for (var i = 0; i < cols.length; i++) {
                data[i] = cols[i].split(',');
            }
            let str = createStr(data);
            result.innerText = str
            download(fileData.name, str)

            //次の入力のためクラスIDとファイル名を消去する
            class_id.value = ""
            document.getElementById("file1").value = ""
        }
        // ファイル読み込みを実行
        reader.readAsText(fileData);
    }

} else {
    file.style.display = 'none';
    result.innerHTML = 'File APIに対応したブラウザでご確認ください';
}
