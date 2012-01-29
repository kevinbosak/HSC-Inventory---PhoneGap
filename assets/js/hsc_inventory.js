function HSCInventory(args) {
    var self = this;

    if (navigator && navigator.network && navigator.network.connection.type == Connection.NONE) {
        // TODO: check for connectivity later, setTimeout?
        //     or allow user to manually re-check 
        alert("No internet connection - starting in offline mode");
    }

    self.api_url = 'http://hsc.bosak.net/api/';
    if (!self.api_url) {
        self.api_url = args.api_url;
    }
    if (self.api_url.substr(-1, 1) != '/') {
        self.api_url = self.api_url + '/';
    }

    self.page_size = 20;

    // TODO: connect to local storage, grab token

    // TODO: Check token, login, store token
    
    // TODO: pull first 'page_size' items from local storage (sorted?) and show on search results page by default

    // not sure we need this, HTML should have this info
    self.current_page = 1;
    self.total_pages = 1;
    self.search_results = []; // ID's only?
    self.search_params = {};
    self.current_scan = null;

    // scan button
    $('#scan_btn').click(function(e) {
        // TODO: also allow pulling from photo album:
        // Camera.sourceType = Camera.PictureSourceType.PHOTOLIBRARY
        
        if (navigator && navigator.camera) {
            navigator.camera.getPicture(
                function(data) {return self.cameraSuccess(data);},
                function(data) {return self.cameraError(data);},
                {
                    quality:         75,  // some iOS devices give memory error for 50 and over
//            encodingType:    Camera.EncodingType.JPEG,  // or PNG
            targetWidth:    300,   // pixels
                    destinationType: Camera.DestinationType.DATA_URL,  
                    sourceType:      Camera.PictureSourceType.CAMERA
            });
        }
        return false;
    });

    // set up live event for items in results list
    $('.results a').live('click', function() {
        var $a = $(this);
        var href = $a.attr('href');
        alert(href);
        return false;
    });

    // hide all pages
    self.get_item_list();
}

HSCInventory.prototype.cameraSuccess = function(imageData) {
    var self = this;
    self.display_page('scan_result');
    self.current_scan = $(document.createElement('img'));
    $('#scan_result div').empty().append(self.current_scan);
    self.current_scan.attr('src', "data:image/jpeg;base64," + imageData).attr('width', '300').attr('id', 'current_scan').load(function() {
        alert('processing image');
        $(this).pixastic('brightness', {brightness: 0, contrast: 3}).pixastic('desaturate');
    });
};

    HSCInventory.prototype.cameraError = function(imageData) {
    alert("Error obtaining the picture");
};

HSCInventory.prototype.display_page = function(page_id) {
    var self = this;
    // TODO: fancy animations
    $('.page').hide();
    $('#' + page_id).show();
};

// Does a HEAD request to get Last-Modified and check for 404.
//   Automatically removes from cache on 404 and grabs new item data if current data is outdated
//   Returns true if item still exists
HSCInventory.prototype.check_item = function(id) {
    var self = this;
};

// Grabs an item's detail via the API and stores it locally
HSCInventory.prototype.get_item = function(id) {
    var self = this;
};

// Uses search params to get and display a list of items
HSCInventory.prototype.get_item_list = function(page) {
    var self = this;

    // use self.search_params
    if (!page) {
        page = 1;
    }

    $.ajax({
        url:    self.api_url + 'items',
        type: 'GET',
        data: {page: page},
        crossDomain: true,
        dateType: 'json',
        success: function(data) {
            self.search_results = data;
            var num_results = data.total;
            var pages = Math.floor(data.total/self.page_size);
            if (data.total % self.page_size) {
                pages++;
            }
            self.total_pages = pages;

            var $results_page = $('#search_results');
            // TODO: pagination
            var $results = $results_page.find('.results ul').empty();
            $.each(data.data, function(i, item) {
                $results.append('<li><a href="' + item.uri + '">' + item.name + '</a> - ' + item.description + '</li>');
            });
            self.display_page('search');
        }
    });
};

// Sends item data for an update and checks response
HSCInventory.prototype.update_item = function(params) {
    var self = this;
};

// sends item data for a create and checks response, returns item id
HSCInventory.prototype.create_item = function(params) {
    var self = this;

    // $.ajax{
        // url: ... ,
        // type: 'POST',
        // success: function(data, textStatus, jqXHR) {
            // var location = jqXHR.getResponseHeader('Location');}
        // }
    // }
};

// renders an item and switches to the item detail page
HSCInventory.prototype.show_item = function(id) {
    var self = this;

    if (self.check_item(id)) {
        // get item details from local storage
        // show item details
    } else {
        // show error
    }
};

// calls to the camera to get pic, scans barcode, and displays results
HSCInventory.prototype.scan_barcode = function() {
    var self = this;
};

// checks out the item and displays result
HSCInventory.prototype.check_out = function(id) {
    var self = this;
};

// checks in the item and displays result
HSCInventory.prototype.check_in = function(id) {
    var self = this;
};

(function(){
    var UPC_SET = {
        "3211": '0',
        "2221": '1',
        "2122": '2',
        "1411": '3',
        "1132": '4',
        "1231": '5',
        "1114": '6',
        "1312": '7',
        "1213": '8',
        "3112": '9'
    };
    
    getBarcodeFromImage = function(imgOrId){
        var doc = document,
            img = "object" == typeof imgOrId ? imgOrId : doc.getElementById(imgOrId),
            canvas = doc.createElement("canvas"),
            width = img.width,
            height = img.height,
            ctx = canvas.getContext("2d"),
            spoints = [1, 9, 2, 8, 3, 7, 4, 6, 5],
            numLines = spoints.length,
            slineStep = height / (numLines + 1),
            round = Math.round;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
        while(numLines--){
            console.log(spoints[numLines]);
            var pxLine = ctx.getImageData(0, slineStep * spoints[numLines], width, 2).data,
                sum = [],
                min = 0,
                max = 0;
            for(var row = 0; row < 2; row++){
                for(var col = 0; col < width; col++){
                    var i = ((row * width) + col) * 4,
                        g = ((pxLine[i] * 3) + (pxLine[i + 1] * 4) + (pxLine[i + 2] * 2)) / 9,
                        s = sum[col];
                    pxLine[i] = pxLine[i + 1] = pxLine[i + 2] = g;
                    sum[col] = g + (undefined == s ? 0 : s);
                }
            }
            for(var i = 0; i < width; i++){
                var s = sum[i] = sum[i] / 2;
                if(s < min){ min = s; }
                if(s > max){ max = s; }
            }
            var pivot = min + ((max - min) / 2),
                bmp = [];
            for(var col = 0; col < width; col++){
                var matches = 0;
                for(var row = 0; row < 2; row++){
                    if(pxLine[((row * width) + col) * 4] > pivot){ matches++; }
                }
                bmp.push(matches > 1);
            }
            var curr = bmp[0],
                count = 1,
                lines = [];
            for(var col = 0; col < width; col++){
                if(bmp[col] == curr){ count++; }
                else{
                    lines.push(count);
                    count = 1;
                    curr = bmp[col];
                }
            }
            var code = '',
                bar = ~~((lines[1] + lines[2] + lines[3]) / 3),
                u = UPC_SET;
            for(var i = 1, l = lines.length; i < l; i++){
                if(code.length < 6){ var group = lines.slice(i * 4, (i * 4) + 4); }
                else{ var group = lines.slice((i * 4 ) + 5, (i * 4) + 9); }
                var digits = [
                    round(group[0] / bar),
                    round(group[1] / bar),
                    round(group[2] / bar),
                    round(group[3] / bar)
                ];
                code += u[digits.join('')] || u[digits.reverse().join('')] || 'X';
                if(12 == code.length){ return code; break; }
            }
            if(-1 == code.indexOf('X')){ return code || false; }
        }
        return false;
    }
})();
