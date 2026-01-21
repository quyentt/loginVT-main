/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
    // https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html
     
    //config.extraPlugins += (config.extraPlugins.length == 0 ? '' : ',') + 'ckeditor_wiris';
    config.extraPlugins += (config.extraPlugins.length == 0 ? '' : ',') + 'ckeditor_wiris,image2';
    //Nếu bạn sử dụng chế độ Full MathML và đối với các phiên bản CKeditor cao hơn 4.0, bạn cũng phải thêm dòng này:
    config.allowedContent = true;

	// The toolbar groups arrangement, optimized for two toolbar rows.
	config.toolbarGroups = [
		{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
		{ name: 'links' },
		{ name: 'insert' },
		{ name: 'forms' },
		{ name: 'tools' },
		{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'others' },
		'/',
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
		{ name: 'styles' },
        { name: 'colors' },  
        { name: 'about' },
        { name: 'wirisplugins', groups: ['ckeditor_wiris_formulaEditor', 'ckeditor_wiris_formulaEditorChemistry'] }
	];
    config.syntaxhighlight_lang = 'csharp';
    config.syntaxhighlight_hideControls = true;
    config.languages = 'vi';
    config.filebrowserBrowseUrl = 'Scripts/ckfinder/ckfinder.html';
    config.filebrowserImageBrowseUrl = 'Scripts/ckfinder/ckfinder.html?Types=Images';
    config.filebrowserFlashBrowseUrl = 'Scripts/ckfinder/ckfinder.html?Types=Flash';
    config.filebrowserUploadUrl = 'Scripts/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=File';
    config.filebrowserImageUploadUrl = 'Scripts/Data';
    config.filebrowserFlashUploadUrl = 'Scripts/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Flash';

    CKFinder.setupCKEditor(null, 'Scripts/ckfinder/');
	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.
	config.removeButtons = 'Underline,Subscript,Superscript';

	// Set the most common block elements.
	config.format_tags = 'p;h1;h2;h3;pre';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';
};
