$("#uploader").on("click",()=>{
  $("#file").click();
});


function readURL(input) {
    if (input && input[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#preview').attr('src', e.target.result);
            $("#p-name").text(input[0].name);
            $("#result").show();

            //submit form
            window.submitForm(e.target.result);
        }

        reader.readAsDataURL(input[0]);
    }
}

$("#file").change(function(){
    readURL(this.files);
});

$('#uploader').on(
    'dragover',
    function(e) {
        e.preventDefault();
        e.stopPropagation();
    }
)
$('#uploader').on(
    'dragenter',
    function(e) {
        e.preventDefault();
        e.stopPropagation();
    }
)
$('#uploader').on(
    'drop',
    function(e){
        if(e.originalEvent.dataTransfer){
            if(e.originalEvent.dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();
                /*UPLOAD FILES HERE*/
                readURL(e.originalEvent.dataTransfer.files);
            }   
        }
    }
);

window.submitForm = function(imageBase64){
    $(".cloud-vision").html('<img src="static/preloader.gif" style="width: 47px;">');
    console.log("submitForm");
    $(".database").html('<img src="static/preloader.gif" style="width: 47px;">');

    $.post("/predict",{
        image : imageBase64.substr(imageBase64.indexOf(',') + 1)
    },function(res){
        $(".cloud-vision,.database").empty();

        res["cloud-vision"].forEach(function(elem,i){
            if(i>=3) return;
            $(".cloud-vision").append(`
                <div class="label">
                    <input type="checkbox" value="`+elem+`"> `+elem+`
                </div>  
            `)
        });

        res["cloud-database"].forEach(function(elem,i){
            if(i>=3) return;
            $(".database").append(`
                <div class="label">
                    `+elem+`
                </div>  
            `)
        });
    });
};

$(document).on("change",".cloud-vision input",function() {
      var checkResults = [];
      var all = [];
      $(".cloud-vision input").each(function(index,elem){
            if(elem.checked)
                checkResults.push(elem.value);
            all.push(elem.value);

            if(index ==  $(".cloud-vision input").length-1){
                $(".database").html('<img src="static/preloader.gif" style="width: 47px;">');
                console.log("/find/words?words="+(checkResults.length==0?all.join(","):checkResults.join(",")));
                $.get("/find/words?words="+(checkResults.length==0?all.join(","):checkResults.join(",")),function(elem){
                    $(".database").empty();
                    elem.forEach(function(item,i){
                        if(i>=3) return;
                        $(".database").append(`
                            <div class="label">
                              `+elem+`
                            </div>  
                        `)
                    });
                })
            }
      });

      
});