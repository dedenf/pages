var w = window.outerWidth;
var video_canvas, video_ctx, stencil_canvas, stencil_ctx;
var alert_canvas, alert_ctx;
var first_photo_canvas, first_photo_ctx, second_photo_canvas, second_photo_ctx;
var first_photo_label, second_photo_label;
var initialized = false;
var dot_positions = [
                      [0, 0],
                      [0, 0],
                      [0, 0],
                      [0, 0]
                  ];
var dot_radius = 30;
var dot_position_index = -1;			//0, tr; 1, br; 2, bl; 3, tl

var StatusEnum = {
            INIT : 0,   						//0, initial;
            SHOW_STENCIL : 1,					//1, show the stencil and ask user to put his/her face in;
            FACE_DETECT_READY: 2,				//2, ready to detect face;
            FACE_DETECTED : 3, 					//3, face detected;
            WAIT_SHOW_DOT: 4,					//4, wait to show indication;
            //SHOW_INDICATION : 5,				//5, show indication to follow the dot;
            SHOW_FIRST_DOT: 6,					//6, show first dot;
            //FIRST_PHOTO_TAKEN : 7,				//7, first photo taken;
            WAIT_SHOW_SECOND_DOT : 8,			//8, wait to show second dot;
            SHOW_SECOND_DOT : 9,	  			//9, show dot and wait for taking second photo;
            //SECOND_PHOTO_TAKEN : 10,	  		//10, second photo taken;
            DONE : 11,	  						//11, done
            // Below only for enroll flow
            WAIT_SHOW_THIRD_DOT: 12,
            SHOW_THIRD_DOT: 13,
            WAIT_SHOW_FOURTH_DOT : 14,
            SHOW_FOURTH_DOT : 15
        };
var status = StatusEnum.INIT;

var first_photo, second_photo, imageData;

var stencil_width = 320;
var stencil_height = 400;
var stencil_x, stencil_y;

var canvas_top = 100;
var canvas_left = 0;
var canvas_width = 540;
var canvas_height = 720;
var original_canvas_width, original_canvas_height;

var text_x, text_y;

var face_detected = false;
var face_not_detected_count = 3;
var face_not_detected_counter = 0;
var face_in_stencil = false;
var face_too_big = false;
var face_too_small = false;
var face_too_big_threshold = 0.4;
var face_too_small_threshold = 0.5;
var face_in_stencil_radius_reducer = 0.4;

var dot_gif;

var random = -1;
var first_photo_tag, second_photo_tag, third_photo_tag, fourth_photo_tag;

var tags = ["tr","br","bl","tl"];		//gaze positions

var time_keeper_count = 2;
var time_keeper_take_photo_count = 3;
var time_keeper_counter = 0;

var mobile = false;

var stencil_notin, stencil_in;
var is_in_stencil = false;

var FlowEnum = {
            ENROLL : 0,
            VERIFY : 1
        };
var flow;
var first_photo_url, second_photo_url, third_photo_url, fourth_photo_url;

$(document).ready(function(){
  mobile = mobile_check();
  if(mobile) {
    canvas_width = 540;
    canvas_height = 720;
    stencil_width = 320;
    stencil_height = 400;
  }
  else {
    canvas_width = 640;
    canvas_height = 480;
    stencil_width = 300;
    stencil_height = 400;
  }

  var urlParams = new URLSearchParams(window.location.search);
  
  console.log(urlParams);
  console.log(window.location.search);

  if(!urlParams.has('flow'))
    alert('not flow in the url parameters.');
  else {
    var flowStr = urlParams.get('flow');
    if(flowStr.toUpperCase() === 'enroll'.toUpperCase())
        flow = FlowEnum.ENROLL;
    else if(flowStr.toUpperCase() === 'verify'.toUpperCase())
        flow = FlowEnum.VERIFY;
    else
        alert('flow ' + flowStr + ' is not correct.')
  }

  main();
});

function mobile_check() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function show_alert() {
    clear_message();
    clear_alert();
    clear_dot();

    var alert_message = "";

    if(face_not_detected_counter > face_not_detected_count)
        alert_message = "Face not detected.";
    else if(face_too_big)
        alert_message = "Please move further.";
    else if(face_too_small)
        alert_message = "Please move closer.";
    else if(!face_in_stencil)
        alert_message = "Please fit face in stencil.";

    alert_ctx.beginPath();
    alert_ctx.font = "20px Nunito";
    alert_ctx.fillStyle = "red";
    alert_ctx.textAlign = "center";
    alert_ctx.fillText(alert_message, text_x, text_y);
}

function clear_alert() {
    alert_ctx.clearRect(0, 0, canvas_width, canvas_height);
}

function show_message(message) {
    clear_message();
    clear_alert();

    message_ctx.beginPath();
    message_ctx.font = "20px Nunito";
    message_ctx.fillStyle = "#11BDC6";
    message_ctx.textAlign = "center";
    message_ctx.fillText(message, text_x, text_y);
}

function clear_message() {
    message_ctx.clearRect(0, 0, canvas_width, canvas_height);
}

// Time job run every time_keeper_count second to check and make status transition
function time_keeper() {
    console.log('status = ' + status);
    console.log('flow =' + flow);
    if(status == StatusEnum.INIT) {
        show_stencil();
        show_alert();

        status = StatusEnum.SHOW_STENCIL;
        setTimeout(ready_detect_face, 2000);
        return;
    }

    if(status >= StatusEnum.SHOW_STENCIL) {
        if(!face_detected) face_not_detected_counter++;
        else face_not_detected_counter = 0;

        if(face_not_detected_counter > face_not_detected_count || face_too_big || face_too_small || !face_in_stencil) {
            show_alert();
            status = StatusEnum.FACE_DETECT_READY;
            random = -1;
            is_in_stencil = false;
            show_stencil();
            return;
        } else {
            clear_alert();
            is_in_stencil = true;
            show_stencil();
        }
    }

    if(time_keeper_counter < time_keeper_count) {
        time_keeper_counter++;
        return;
    } else
        time_keeper_counter = 0;

    if(status == StatusEnum.FACE_DETECTED) {
        show_message("Face ready. Follow first dot.");
        status = StatusEnum.WAIT_SHOW_DOT;
        setTimeout(show_dot, 1000);
    } else if(status == StatusEnum.SHOW_FIRST_DOT) {
        first_photo_tag = tags[random];
        first_photo_ctx.putImageData(imageData, 0, 0);
        first_photo_url = first_photo_canvas.toDataURL("image/jpeg").replace('data:image/jpeg;base64,', '');
        show_message("First pic taken. Follow second dot.");
        status = StatusEnum.WAIT_SHOW_SECOND_DOT;
        dot_gif.style.display = "none";
        setTimeout(show_dot, 1000);
    } else if(status == StatusEnum.SHOW_SECOND_DOT) {
        second_photo_tag = tags[random];
        second_photo_ctx.putImageData(imageData, 0, 0);
        second_photo_url = second_photo_canvas.toDataURL("image/jpeg").replace('data:image/jpeg;base64,', '');
        if(flow == FlowEnum.VERIFY) {
            show_message("All pic taken");
            status = StatusEnum.DONE;
            dot_gif.style.display = "none";
            video_canvas.style.display="none";
            stencil_canvas.style.display="none";
            message_canvas.style.display="none";
            dot_canvas.style.display="none";
            alert_canvas.style.display="none";
            liveness_check();
        } else {
            show_message("Second pic taken. Follow third dot.");
            status = StatusEnum.WAIT_SHOW_THIRD_DOT;
            dot_gif.style.display = "none";
            setTimeout(show_dot, 1000);
        }
    } else if(status == StatusEnum.SHOW_THIRD_DOT) {
        third_photo_tag = tags[random];
        first_photo_ctx.putImageData(imageData, 0, 0);
        third_photo_url = first_photo_canvas.toDataURL("image/jpeg").replace('data:image/jpeg;base64,', '');
        show_message("Third pic taken. Follow fourth dot.");
        status = StatusEnum.WAIT_SHOW_FOURTH_DOT;
        dot_gif.style.display = "none";
        setTimeout(show_dot, 1000);
    } else if(status == StatusEnum.SHOW_FOURTH_DOT) {
        fourth_photo_tag = tags[random];
        second_photo_ctx.putImageData(imageData, 0, 0);
        fourth_photo_url = second_photo_canvas.toDataURL("image/jpeg").replace('data:image/jpeg;base64,', '');
        if(flow == FlowEnum.ENROLL) {
            show_message("All pic taken");
            status = StatusEnum.DONE;
            dot_gif.style.display = "none";
            video_canvas.style.display="none";
            stencil_canvas.style.display="none";
            message_canvas.style.display="none";
            dot_canvas.style.display="none";
            alert_canvas.style.display="none";
            enroll();
        } else
            alert('the flow is not enroll.');
    }
}

function liveness_check() {
    var user_info = {
        images: [
            {
                data: first_photo_url,
                tag: first_photo_tag,
                modality: 'face'
            },
            {
                data: second_photo_url,
                tag: second_photo_tag,
                modality: 'face'
            }
        ]
    };
    // Send user info back to app
    // Android.verify(btoa(JSON.stringify(user_info)));
    console.log(JSON.stringify(user_info));
}

function enroll() {
    var user_info = {
        images: [
            {
                data: first_photo_url,
                tag: first_photo_tag,
                modality: 'face'
            },
            {
                data: second_photo_url,
                tag: second_photo_tag,
                modality: 'face'
            },
            {
                data: third_photo_url,
                tag: third_photo_tag,
                modality: 'face'
            },
            {
                data: fourth_photo_url,
                tag: fourth_photo_tag,
                modality: 'face'
            }
        ]
    };
    // Send user info back to app
    // Android.enroll(btoa(JSON.stringify(user_info)));
    console.log(JSON.stringify(user_info));
}

function ready_detect_face() {
    status = StatusEnum.FACE_DETECT_READY;
}

function show_stencil() {
    if(is_in_stencil) {
        stencil_in.width = stencil_width;
        stencil_in.height = stencil_height;
        stencil_in.style.left = (stencil_x - stencil_width / 2).toString() + "px";
        stencil_in.style.top = (stencil_y - stencil_height / 2).toString() + "px";
        stencil_in.style.display = "block";
        stencil_notin.style.display = "none";
    } else {
        stencil_notin.width = stencil_width;
        stencil_notin.height = stencil_height;
        stencil_notin.style.left = (stencil_x - stencil_width / 2).toString() + "px";
        stencil_notin.style.top = (stencil_y - stencil_height / 2).toString() + "px";
        stencil_notin.style.display = "block";
        stencil_in.style.display = "none";
    }
}

function show_dot() {
    console.log('in show_dot, status = ' + status);
    console.log('random = ' + random);
    dot_ctx.clearRect(0, 0, dot_canvas.width, dot_canvas.height);
    show_stencil();

    if(flow == FlowEnum.ENROLL) {
        random++;
    } else {
        do {
            random = Math.floor(Math.random() * 4);
        } while(random == dot_position_index || same_area(dot_position_index, random))
    }

    if(random > 3) {
        console.log('error: random should be less than or equal to 3, now it is ' + random);
        return;
    }
    dot_position_index = random;

    dot_gif.width = dot_radius * 2;
    dot_gif.height = dot_radius * 2;
    dot_gif.style.top = (dot_positions[random][1] - dot_radius).toString() + "px";
    dot_gif.style.left = (dot_positions[random][0] - dot_radius).toString() + "px";
    dot_gif.style.display = "block";

    if(status == StatusEnum.WAIT_SHOW_DOT)
        status = StatusEnum.SHOW_FIRST_DOT;
    else if(status == StatusEnum.WAIT_SHOW_SECOND_DOT)
        status = StatusEnum.SHOW_SECOND_DOT;
    else if(status == StatusEnum.WAIT_SHOW_THIRD_DOT)
        status = StatusEnum.SHOW_THIRD_DOT;
    else if(status == StatusEnum.WAIT_SHOW_FOURTH_DOT)
        status = StatusEnum.SHOW_FOURTH_DOT;
}

// Judge if two dots are in same vertical area
function same_area(index1, index2) {
    if(index1 == 0 || index1 == 3)
        return index2 == 0 || index2 == 3 ? true : false;
    else
        return index2 == 0 || index2 == 3 ? false : true;
}

function clear_dot() {
    dot_gif.style.display = "none";
}

function check_face_in_stencil(face_detected) {
    if(face_detected[2] > stencil_width * (1 + face_too_big_threshold))
        face_too_big = true;
    else
        face_too_big = false;

    if(face_detected[2] < stencil_width * (1 - face_too_small_threshold))
        face_too_small = true;
    else
        face_too_small = false;

    var threshold = 0;

    var radius;

    if(status == StatusEnum.FACE_DETECT_READY)
        radius = face_detected[2] / 2;
    else
        radius = (face_detected[2] / 2) * (1 - face_in_stencil_radius_reducer);

    if((face_detected[0] + radius > stencil_y + stencil_height / 2 + threshold) ||
    (face_detected[0] - radius < stencil_y - stencil_height / 2 - threshold) ||
    (face_detected[1] + radius > stencil_x + stencil_width / 2 + threshold) ||
    (face_detected[1] - radius < stencil_x - stencil_width / 2 - threshold)) {
        face_in_stencil = false;
    } else {
        face_in_stencil =  true;
    }
}


var initialized = false;
function main() {
    status = StatusEnum.INIT;
    /*
        (0) check whether we're already running face detection
    */
    if(initialized) {
        video_canvas.style.display="block";
        stencil_canvas.style.display="block";
        message_canvas.style.display="block";
        alert_canvas.style.display="block";
        first_photo_div.style.display="none";
        second_photo_div.style.display="none";
        return; // if yes, then do not initialize everything again
    }

    original_canvas_width = canvas_width;
    original_canvas_height = canvas_height;
    if(mobile) {
        canvas_width = w - 20;
        canvas_height = Math.floor(canvas_width * original_canvas_height / original_canvas_width);
    }
    video_canvas = document.getElementById('video');
    video_canvas.width = canvas_width.toString();
    video_canvas.height = canvas_height.toString();
    video_canvas.style.top = canvas_top.toString + "px";
    video_canvas.style.left = canvas_left.toString + "px";
    video_ctx = video_canvas.getContext('2d');
    video_ctx.translate(canvas_width, 0);
    video_ctx.scale(-1, 1);
    video_ctx.clearRect(0, 0, video_canvas.width, video_canvas.height);

    stencil_canvas = document.getElementById('stencil');
    stencil_canvas.width = canvas_width.toString();
    stencil_canvas.height = canvas_height.toString();
    stencil_canvas.style.top = canvas_top.toString + "px";
    stencil_canvas.style.left = canvas_left.toString + "px";
    stencil_ctx = stencil_canvas.getContext('2d');
    stencil_ctx.clearRect(0, 0, stencil_canvas.width, stencil_canvas.height);

    message_canvas = document.getElementById('message');
    message_canvas.width = canvas_width.toString();
    message_canvas.height = canvas_height.toString();
    message_canvas.style.top = canvas_top.toString + "px";
    message_canvas.style.left = canvas_left.toString + "px";
    message_ctx = message_canvas.getContext('2d');
    message_ctx.clearRect(0, 0, message_canvas.width, message_canvas.height);

    dot_canvas = document.getElementById('dot');
    dot_canvas.width = canvas_width.toString();
    dot_canvas.height = canvas_height.toString();
    dot_canvas.style.top = canvas_top.toString + "px";
    dot_canvas.style.left = canvas_left.toString + "px";
    dot_ctx = dot_canvas.getContext('2d');
    dot_ctx.clearRect(0, 0, dot_canvas.width, dot_canvas.height);

    alert_canvas = document.getElementById('alert');
    alert_canvas.width = canvas_width.toString();
    alert_canvas.height = canvas_height.toString();
    alert_canvas.style.top = canvas_top.toString + "px";
    alert_canvas.style.left = canvas_left.toString + "px";
    alert_ctx = alert_canvas.getContext('2d');
    alert_ctx.clearRect(0, 0, alert_canvas.width, alert_canvas.height);

    first_photo_canvas = document.getElementById('first_photo');
    first_photo_ctx = first_photo_canvas.getContext('2d');
    first_photo_canvas.width = canvas_width.toString();
    first_photo_canvas.height = canvas_height.toString();
    first_photo_ctx.translate(first_photo_canvas.width, 0);
    first_photo_ctx.scale(-1, 1);
    first_photo_ctx.clearRect(0, 0, first_photo_canvas.width.toString() + "px", first_photo_canvas.height.toString() + "px");
    second_photo_canvas = document.getElementById('second_photo');
    second_photo_ctx = second_photo_canvas.getContext('2d');
    second_photo_canvas.width = canvas_width.toString();
    second_photo_canvas.height = canvas_height.toString();
    second_photo_ctx.translate(second_photo_canvas.width, 0);
    second_photo_ctx.scale(-1, 1);
    second_photo_ctx.clearRect(0, 0, second_photo_canvas.width.toString() + "px", second_photo_canvas.height.toString() + "px");

    first_photo_div = document.getElementById('first_photo_div');
    second_photo_div = document.getElementById('second_photo_div');

    dot_gif = document.getElementById('dot_gif');

    dot_positions[3][0] = 50;
    dot_positions[3][1] = 50;
    dot_positions[0][0] = canvas_width - 50;
    dot_positions[0][1] = 50;
    dot_positions[2][0] = 50;
    dot_positions[2][1] = canvas_height - 50;
    dot_positions[1][0] = canvas_width - 50;
    dot_positions[1][1] = canvas_height - 50;

    stencil_notin = document.getElementById('stencil_notin');
    stencil_in = document.getElementById('stencil_in');

    stencil_width = Math.floor(stencil_width * canvas_width / original_canvas_width);
    stencil_height = Math.floor(stencil_height * canvas_height / original_canvas_height);

    stencil_x = stencil_canvas.width / 2;
    stencil_y = stencil_canvas.height / 2 -20;

    text_x = canvas_width / 2;
    text_y = canvas_height - 40;

    setInterval(time_keeper, 1000);

    /*
        (1) initialize the pico.js face detector
    */
    var update_memory = pico.instantiate_detection_memory(5); // we will use the detecions of the last 5 frames
    /*
        (2) initialize the lploc.js library with a pupil localizer
    */

    /*
        (3) get the drawing context on the canvas and define a function to transform an RGBA image to grayscale
    */
    //var ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
    function rgba_to_grayscale(rgba, nrows, ncols) {
        var gray = new Uint8Array(nrows*ncols);
        for(var r=0; r<nrows; ++r)
            for(var c=0; c<ncols; ++c)
                // gray = 0.2*red + 0.7*green + 0.1*blue
                gray[r*ncols + c] = (2*rgba[r*4*ncols+4*c+0]+7*rgba[r*4*ncols+4*c+1]+1*rgba[r*4*ncols+4*c+2])/10;
        return gray;
    }
    /*
        (4) this function is called each time a video frame becomes available
    */
    var processfn = function(video, dt) {
        // render the video frame to the canvas element and extract RGBA pixel data
        video_ctx.drawImage(video, 0, 0, canvas_width, canvas_height);
        imageData = video_ctx.getImageData(0, 0, canvas_width, canvas_height);
        var rgba = video_ctx.getImageData(0, 0, canvas_width, canvas_height).data;
        // prepare input to `run_cascade`
        image = {
            "pixels": rgba_to_grayscale(rgba, canvas_height, canvas_width),
            "nrows": canvas_height,
            "ncols": canvas_width,
            "ldim": canvas_width
        }

        params = {
            "shiftfactor": 0.1, // move the detection window by 10% of its size
            "minsize": 100,     // minimum size of a face
            "maxsize": 1000,    // maximum size of a face
            "scalefactor": 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
        }
        // run the cascade over the frame and cluster the obtained detections
        // dets is an array that contains (r, c, s, q) quadruplets
        // (representing row, column, scale and detection score)
        dets = pico.run_cascade(image, facefinder_classify_region, params);
        dets = update_memory(dets);
        dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
        // draw detections
        face_detected = false;
        for(i=0; i<dets.length; ++i)
            // check the detection score
            // if it's above the threshold, draw it
            // (the constant 50.0 is empirical: other cascades might require a different one)
            if(dets[i][3]>50.0)
            {
                face_detected = true;
                if(status >= StatusEnum.FACE_DETECT_READY && status != StatusEnum.DONE)
                    check_face_in_stencil(dets[i]);

                if(status == StatusEnum.FACE_DETECT_READY) {
                    if(!face_too_big && !face_too_small && face_in_stencil) {
                        status = StatusEnum.FACE_DETECTED;
                    }
                }
            }
    }
    /*
        (5) instantiate camera handling (see https://github.com/cbrandolino/camvas)
    */
    var mycamvas = new camvas(video_ctx, processfn);
    /*
        (6) it seems that everything went well
    */
    initialized = true;
}