$(document).ready(function() {

//depenging on value of the cookie, display login or logout
if( getCookie('ramp_wiki_li') == null )
{
	$('#menu').append("<li id=\"wiki_login\" class=\"wiki_login menu_slice\"><a href=\"#\">Wiki Login</a></li>");
}else
{
	$('#menu').append("<li id=\"wiki_logout\" class=\"wiki_login menu_slice\"><a href=\"#\">Wiki Logout</a></li>");
}

var ace_height = $(window).height() / 1.5;
$('#editor_container').css ( { "height" : ace_height });


$(window).resize(function() { 

var ace_height = $(window).height() / 1.5;
$('#editor_container').css ( { "height" : ace_height });

});


function editor_display() {
	$("#ead_files option:selected").each(function () {
	    $('#edit_xml').remove();
	    $('#wiki_update').remove();
	    $('#wiki_save').remove();
	    $('#get_wiki').remove();
	    $('#wikieditor').remove();
	    $('#post_wiki').remove();
	    $('#draft_container').remove();
	    $('#editor_container').show();
	    // When one of the files is selected...
	    eac_xml_path = $(this).val();
	   
	   
	    //Get the XML

	    $.get('get_eac_xml.php?eac=' + eac_xml_path , function (data) {


		// Set up Ace editr

  		editor.getSession().setValue(data);
		editor.resize();
		editor.focus();

		// Stick the XML in Ace editor
		edited_xml = editor.getSession().getValue();

		//enable ingest buttons
		$('.ingest_button').removeAttr('disabled');


		// then validate the XML
		validateXML();

		// Check to see if there is some existing wiki markup
		wikiCheck();

   	    });


	    $('#save_eac').click(function(data) {
		// This saves the XML by getting the the text from Ace editor


		editor_xml = editor.getSession().getValue();

		// and POSTing is to update_eac_xml

		$.post('update_eac_xml.php', {xml: editor_xml, ead_file: eac_xml_path} , function(data) {

$('#validation_text').html("<p>File saved</p>");

window.setTimeout(function(){$('#validation_text').html(' ');}, 5000);


		});
            });

	});


}



    $('#ead_files').ready(function () {
	
editor_display();

   });

    $('#ead_files').change (function()  {
  // This tracks the selection of a file name. The select control is generated by the eac_edit.php script.
	editor_display();
    });


    $('#editor').keyup(throttle(function() {

	// When the user is typing, validate it

	edited_xml = editor.getValue();

	validateXML();



    }));


    // This function delays the function that a keystroke triggers. You can change the delay at the bottom of the function.

    function throttle(f, delay){
	var timer = null;
	return function(){
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = window.setTimeout(function(){
		f.apply(context, args);
            },
				      delay || 500);
	};
    }

    window.validateXML = function( callback ) {


	// POST some XML to validate.php and get back some JSON that includes either an response that says that it's valid or a JSON document that includes the errrors
	$.post('validate.php', {eac_xml: edited_xml}, function(data) {

	    if(typeof callback == 'undefined')
		callback = function(){};

	    if (data.status === "valid") {
		// Make the little Oxygen-esque square green if valid

		$('#validation').css({"background-color":"green"});

		// Make the valdiation text area blank

		$('#validation_text').html('');

		callback(true);

	    } else {

		response = data;
		// Make the Oxygen-esque square red
		$('#validation').css({"background-color":"red"});

		// Stick the error message into the validation_text div
		$('#validation_text').html('<p>Error: ' + response[0].message + '</p><p>Line: ' + response[0].line + '</p>');

		callback(false)
	    }

	},"json").fail(function() {
            $('#validation').css({"background-color":"red"});
	    	$('#validation_text').html('<p>Your XML is not well-formed or there is an issue with the validation service</p>');

	    	if(typeof callback == 'undefined')
			callback = function(){};

            console.log("error"); 
        	callback(false);
        });
    }


    $('#edit').click(function() {
//    	$('#wiki_update').remove();
//	$('#edit').hide();
		$('#editor_container').hide();
		$('#save_eac').hide();
	//	$('#ingest_buttons').show();

	
		$('#validation').hide();

	
	eacToMediaWiki();

    });


    function wikiCheck() {



	$.get('get_wiki.php', {ead_path : eac_xml_path}, function(markup) {

	    // This resets the stuff that was hidden if there was a database entry containing wiki markup for the file
	    $('#edit').show();
	    $('#editor_container').show();
	    $('#save_eac').show();
	    $('#ingest_buttons').show();
	    $('#validation').show();

	    if (markup != "") {
		// Hide this stuff if there is wiki markup
		$('#edit').hide();
		$('#editor_container').hide();
		$('#save_eac').hide();
		$('#ingest_buttons').hide();
		$('#validation').hide();


		//Append some controls for dealing with the wikimarkup
		$('#edit_controls').append("<div id=\"wikieditor\"><div class=\"wiki_container\"> \
			<textarea id=\"wikimarkup\">" + markup + "</textarea></div></div>");

		$('#edit_controls').append("<div style=\"width : 100%; float: left;\"><button id=\"get_wiki\" class=\"pure-button pure-button-primary\">Get Existing Wiki</button> \
			<button class=\"update_button pure-button pure-button-primary\" id=\"wiki_update\">Update</button> \
			<button class=\"update_button pure-button pure-button-primary\" id=\"edit_xml\">Edit XML</button></div>");

		setupGetWiki();

	   
	


		$(window).resize(function() { 

		

		});


	   	$('#edit_xml').on('click', function() {


    		    //Show the XML editor ui and wiki markup editor
		    $('#edit').show();
		    $('#editor_container').show();
		    $('#save_eac').show();
		    $('#ingest_buttons').show();
		    $('#validation').show();
		    $('#wikieditor').remove();
		    $('#edit_xml').remove();
		    $('#wiki_update').remove();
		    $('#get_wiki').remove();
		    $('#post_wiki').remove();
		    $('#draft_container').remove();
	   	});

	   	$('#wiki_update').on('click', function() {


	   	    updated_markup = document.getElementById('wikimarkup').value;

		    $.post('update_wiki.php', {media_wiki: updated_markup, ead_path: eac_xml_path}, function(data) {



	    	    });


		});

	    }


	});

    }


    function eacToMediaWiki() {

    edited_xml = editor.getValue();

	$.post('eac_mediawiki.php', {eac_text: edited_xml}, function(data) {

	    $('#wiki_save').remove();
	    $('#wikieditor').remove();


	    $('#edit_controls').append('<div id="wikieditor"><div class="wiki_container"> \
	    	<textarea id="wikimarkup">' + data + '</textarea></div></div>');
	    $('#edit_controls').append("<div style=\"width : 100%; float: left;\"> \
	    	<button class=\"save_button pure-button pure-button-primary\"  id=\"wiki_save\">Save Draft</button></div>");

	    var wiki_height = $(window).height() / 1.3;
	    


		$(window).resize(function() { 

			var wiki_height = $(window).height() / 1.3;
	

		});


	    // Save the wikimarkup

	    $('#wiki_save').on('click', function() {

		wiki_markup_data = $('#wikimarkup').val();

	    	$.post('post_wiki.php', {media_wiki: wiki_markup_data, ead_path: eac_xml_path}, function(data) {

	    		// Hide this stuff if there is wiki markup
				$('#edit').hide();
				$('#editor_container').hide();
				$('#save_eac').hide();
				$('#ingest_buttons').hide();
				$('#validation').hide();
				$('#wiki_save').hide();

				//Append some controls for dealing with the wikimarkup
				$('#edit_controls').append("<div style=\"width : 100%; float: left;\"><button id=\"get_wiki\" class=\"pure-button pure-button-primary\">Get Existing Wiki</button> \
					<button class=\"update_button pure-button pure-button-primary\" id=\"wiki_update\">Update</button> \
					<button class=\"update_button pure-button pure-button-primary\" id=\"edit_xml\">Edit XML</button></div>");

				setupGetWiki();

			   	var wiki_height = $(window).height() / 1.3;
			


				$(window).resize(function() { 

				

				});


			   	$('#edit_xml').on('click', function() {

		    		//Show the XML editor ui and wiki markup editor
				    $('#edit').show();
				    $('#editor_container').show();
				    $('#save_eac').show();
				    $('#ingest_buttons').show();
				    $('#validation').show();
				    $('#edit_xml').remove();
				    $('#wikieditor').remove();
				    $('#wiki_update').remove();
				    $('#get_wiki').remove();
				    $('#post_wiki').remove();
				    $('#draft_container').remove();

			   	});

			   	$('#wiki_update').on('click', function() {


			   	    updated_markup = document.getElementById('wikimarkup').value;

				    $.post('update_wiki.php', {media_wiki: updated_markup, ead_path: eac_xml_path}, function(data) {



			    	});


				});

			});

	    });




	});


    }






});

//functions that can be used by multiple js files

/*
* encode_utf8 encodes passed string to utf8
* @method encode_utf8
*/
function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

/*
* decode_utf8 decodes passed string from utf8
* @method decode_utf8
*/
function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

/*
* unique removes duplicates from passed array and retuns it
* @method unique
*/
var unique = function(origArr) {
    var newArr = [],
        origLen = origArr.length,
        found,
        x, y;

    for ( x = 0; x < origLen; x++ ) {
        found = undefined;
        for ( y = 0; y < newArr.length; y++ ) {
            if ( origArr[x] === newArr[y] ) {
              found = true;
              break;
            }
        }
        if ( !found) newArr.push( origArr[x] );
    }
   return newArr;
};

/*
* html_decode decoded html entities
* @method html_decode
*/
function html_decode( lstrEncodedHTML )
{
	return lstrEncodedHTML.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

/*
* makeDialog creates dialog box from passed selector with passed title 
* @method makeDialog
*/
function makeDialog( lstrSelector, lstrTitle )
{
	if( typeof lstrTitle == 'undefined')
		lstrTitle = 'Response';

	$(lstrSelector).dialog({
        autoOpen: true,
        resizable: false,
        modal: true,
        closeOnEscape: true,
        title: lstrTitle,
        buttons:{
            "Ok":function(){
                $(this).dialog("close");
                $(this).remove();
            }
        },
        close:function(){
            $(this).remove();
        }
	});
}

/*
* makePromptDialog creates dialog prompt box from passed selector with passed title and calls callback once OK is clicked
* @method makePromptDialog
*/
function makePromptDialog( lstrSelector, lstrTitle, callback )
{
	$( lstrSelector ).dialog({
        autoOpen: true,
        resizable: false,
        modal: true,
        width: 'auto',
        closeOnEscape: true,
        title: lstrTitle,
        buttons:{
            "Ok":function(){
            	callback(this);                
            }
        },
        close:function(){
            $(this).remove();
        }
	});

	$( lstrSelector ).find( "form" ).submit(function( event ) {
        $(this).parent().parent().find('span:contains("Ok")').click();
        event.preventDefault();
    });
}

/*
* getCookie gets values of cookie
* @method getCookie
*/
function getCookie(c_name)
{
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1)
	  {
	  c_start = c_value.indexOf(c_name + "=");
	  }
	if (c_start == -1)
	  {
	  c_value = null;
	  }
	else
	  {
	  c_start = c_value.indexOf("=", c_start) + 1;
	  var c_end = c_value.indexOf(";", c_start);
	  if (c_end == -1)
	  {
	c_end = c_value.length;
	}
	c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}

/*
* deleteCookie deletes cookie
* @method deleteCookie
*/
function deleteCookie(name)
{
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
