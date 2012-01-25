function HSCInventory(args) {
    var self = this;

    if (navigator.network.connection.type == Connection.NONE) {
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

    // scan button
    $('#header .button_list a[href="#scan"]').click(function() {
        // TODO: also allow pulling from photo album:
        // Camera.sourceType = Camera.PictureSourceType.PHOTOLIBRARY
        
        var picture = camera.getPicture(
            function() {return this.cameraSuccess();},
            function() {return this.cameraError();},
            {
                quality:         75,  // some iOS devices give memory error for 50 and over
//            encodingType:    Camera.EncodingType.JPEG,  // or PNG
//            targetWidth:    400,   // pixels
                destinationType: Camera.DestinationType.DATA_URL,  
                sourceType:      Camera.PictureSourceType.CAMERA
        });
        alert("Got picture of size: " + picture.length);
    });

    // set up live event for items in results list
    $('.results a').live('click', function() {
        var $a = $(this);
        var href = $a.attr('href');
        alert(href);
    });

    // hide all pages
    self.get_item_list();
}

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
                $results.append('<li><a href="#' + item.inventory_id + '">' + item.name + '</a> - ' + item.description + '</li>');
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
