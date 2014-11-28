$( function() {

    if ( window.lt_ie_7 ) {
            show_modal(
                "Browser not supported",
                "Sorry, the workflow editor is not supported for IE6 and below."
            );
            return;
    }

    // Init searching.
    $("#tool-search-query").click( function (){
        $(this).focus();
        $(this).select();
    })
    .keyup( function () {
        // Remove italics.
        $(this).css("font-style", "normal");
        // Don't update if same value as last time
        if ( this.value.length < 3 ) {
            reset_tool_search(false);
        } else if ( this.value != this.lastValue ) {
            // Add class to denote that searching is active.
            $(this).addClass("search_active");
            // input.addClass(config.loadingClass);
            // Add '*' to facilitate partial matching.
            var q = this.value + '*';
            // Stop previous ajax-request
            if (this.timer) {
                clearTimeout(this.timer);
            }
            // Start a new ajax-request in X ms
            $("#search-spinner").show();
            this.timer = setTimeout(function () {
                $.get(tool_search_url, { query: q }, function (data) {
                    // input.removeClass(config.loadingClass);
                    // Show live-search if results and search-term aren't empty
                    $("#search-no-results").hide();
                    // Hide all tool sections.
                    $(".toolSectionWrapper").hide();
                    // This hides all tools but not workflows link (which is in a .toolTitle div).
                    $(".toolSectionWrapper").find(".toolTitle").hide();
                    if ( data.length != 0 ) {
                        // Map tool ids to element ids and join them.
                        var s = $.map( data, function( n, i ) { return "link-" + n; } );
                        // First pass to show matching tools and their parents.
                        $(s).each( function(index,id) {
                            // Add class to denote match.
                            $("[id='"+id+"']").parent().addClass("search_match");
                            $("[id='"+id+"']").parent().show().parent().parent().show().parent().show();
                        });
                        // Hide labels that have no visible children.
                        $(".toolPanelLabel").each( function() {
                           var this_label = $(this);
                           var next = this_label.next();
                           var no_visible_tools = true;
                           // Look through tools following label and, if none are visible, hide label.
                           while (next.length !== 0 && next.hasClass("toolTitle")) {
                               if (next.is(":visible")) {
                                   no_visible_tools = false;
                                   break;
                               } else {
                                   next = next.next();
                               }
                            }
                            if (no_visible_tools) {
                                this_label.hide();
                            }
                        });
                    } else {
                        $("#search-no-results").show();
                    }
                    $("#search-spinner").hide();
                }, "json" );
            }, 200 );
        }
        this.lastValue = this.value;
    });

    // Canvas overview management
    canvas_manager = new CanvasManager( $("#canvas-viewport"), $("#overview") );

    // Initialize workflow state
    reset();
    // Load the datatype info
    $.ajax( {
        url: get_datatypes_url,
        dataType: "json",
        cache: false,
        success: function( data ) {
            populate_datatype_info( data );
            // Load workflow definition
            $.ajax( {
                url: load_workflow_url,
                data: { id: workflow_id, "_": "true" },
                dataType: 'json',
                cache: false,
                success: function( data ) {
                     reset();
                     workflow.from_simple( data );
                     workflow.has_changes = false;
                     workflow.fit_canvas_to_nodes();
                     scroll_to_nodes();
                     canvas_manager.draw_overview();
                     // Determine if any parameters were 'upgraded' and provide message
                     upgrade_message = "";
                     $.each( data.upgrade_messages, function( k, v ) {
                        upgrade_message += ( "<li>Step " + ( parseInt(k, 10) + 1 ) + ": " + workflow.nodes[k].name + "<ul>");
                        $.each( v, function( i, vv ) {
                            upgrade_message += "<li>" + vv +"</li>";
                        });
                        upgrade_message += "</ul></li>";
                     });
                     if ( upgrade_message ) {
                        show_modal( "Workflow loaded with changes",
                                    "Problems were encountered loading this workflow (possibly a result of tool upgrades). Please review the following parameters and then save.<ul>" + upgrade_message + "</ul>",
                                    { "Continue" : hide_modal } );
                     } else {
                        hide_modal();
                     }
                     show_workflow_parameters();
                 },
                 beforeSubmit: function( data ) {
                     show_message( "Loading workflow", "progress" );
                 }
            });
        }
    });

    // For autosave purposes
    $(document).ajaxStart( function() {
        active_ajax_call = true;
        $(document).bind( "ajaxStop.global", function() {
            active_ajax_call = false;
        });
    });

    $(document).ajaxError( function ( e, x ) {
        // console.log( e, x );
        var message = x.responseText || x.statusText || "Could not connect to server";
        show_modal( "Server error", message, { "Ignore error" : hide_modal } );
        return false;
    });

    make_popupmenu( $("#workflow-options-button"), {
        "Save" : save_current_workflow,
        "Run": function() {
            window.location = run_workflow_url;
        },
        //"Create New" : create_new_workflow_dialog,
        "Edit Attributes" : edit_workflow_attributes,
        //"Edit Workflow Outputs": edit_workflow_outputs,
        "Auto Re-layout": layout_editor,
        //"Load a Workflow" : load_workflow,
        "Close": close_editor
    });

    function edit_workflow_outputs(){
        workflow.clear_active_node();
        $('.right-content').hide();
        var new_content = "";
        for (var node_key in workflow.nodes){
            var node = workflow.nodes[node_key];
            if(node.type == 'tool'){
                new_content += "<div class='toolForm' style='margin-bottom:5px;'><div class='toolFormTitle'>Step " + node.id + " - " + node.name + "</div>";
                for (var ot_key in node.output_terminals){
                    var output = node.output_terminals[ot_key];
                    // if (node.workflow_outputs[node.id + "|" + output.name]){
                    if ($.inArray(output.name, node.workflow_outputs) != -1){
                        new_content += "<p>"+output.name +"<input type='checkbox' name='"+ node.id + "|" + output.name +"' checked /></p>";
                    }
                    else{
                        new_content += "<p>"+output.name +"<input type='checkbox' name='"+ node.id + "|" + output.name +"' /></p>";
                    }
                }
                new_content += "</div>";
            }
        }
        $("#output-fill-area").html(new_content);
        $("#output-fill-area input").bind('click', function(){
            var node_id = this.name.split('|')[0];
            var output_name = this.name.split('|')[1];
            if (this.checked){
                if($.inArray(output_name, workflow.nodes[node_id].workflow_outputs) == -1){
                    workflow.nodes[node_id].workflow_outputs.push(output_name);
                }//else it's already in the array.  Shouldn't happen, but forget it.
            }else{
                while ($.inArray(output_name, workflow.nodes[node_id].workflow_outputs) != -1){
                    var ia = $.inArray(output_name, workflow.nodes[node_id].workflow_outputs);
                    workflow.nodes[node_id].workflow_outputs = workflow.nodes[node_id].workflow_outputs.slice(0,ia).concat( workflow.nodes[node_id].workflow_outputs.slice(ia+1) );
                }
            }
            workflow.has_changes = true;
        });
        $('#workflow-output-area').show();
    }

    function layout_editor() {
        workflow.layout();
        workflow.fit_canvas_to_nodes();
        scroll_to_nodes();
        canvas_manager.draw_overview();
    }

    function edit_workflow_attributes() {
        workflow.clear_active_node();
        $('.right-content').hide();
        $('#edit-attributes').show();

    }

    // On load, set the size to the pref stored in local storage if it exists
    overview_size = $.jStorage.get("overview-size");
    if (overview_size !== undefined) {
        $("#overview-border").css( {
            width: overview_size,
            height: overview_size
        });
    }

    // Show viewport on load unless pref says it's off
    if ($.jStorage.get("overview-off")) {
        hide_overview();
    } else {
        show_overview();
    }

    // Stores the size of the overview into local storage when it's resized
    $("#overview-border").bind( "dragend", function( e, d ) {
        var op = $(this).offsetParent();
        var opo = op.offset();
        var new_size = Math.max( op.width() - ( d.offsetX - opo.left ),
                                 op.height() - ( d.offsetY - opo.top ) );
        $.jStorage.set("overview-size", new_size + "px");
    });

    function show_overview() {
        $.jStorage.set("overview-off", false);
        $("#overview-border").css("right", "0px");
        $("#close-viewport").css("background-position", "0px 0px");
    }

    function hide_overview() {
        $.jStorage.set("overview-off", true);
        $("#overview-border").css("right", "20000px");
        $("#close-viewport").css("background-position", "12px 0px");
    }

    // Lets the overview be toggled visible and invisible, adjusting the arrows accordingly
    $("#close-viewport").click( function() {
        if ( $("#overview-border").css("right") === "0px" ) {
            hide_overview();
        } else {
            show_overview();
        }
    });

    // Unload handler
    window.onbeforeunload = function() {
        if ( workflow && workflow.has_changes ) {
            return "There are unsaved changes to your workflow which will be lost.";
        }
    };

    // Tool menu
    $( "div.toolSectionBody" ).hide();
    $( "div.toolSectionTitle > span" ).wrap( "<a href='#'></a>" );
    var last_expanded = null;
    $( "div.toolSectionTitle" ).each( function() {
       var body = $(this).next( "div.toolSectionBody" );
       $(this).click( function() {
           if ( body.is( ":hidden" ) ) {
               if ( last_expanded ) last_expanded.slideUp( "fast" );
               last_expanded = body;
               body.slideDown( "fast" );
           }
           else {
               body.slideUp( "fast" );
               last_expanded = null;
           }
       });
    });

    // Rename async.
    async_save_text("workflow-name", "workflow-name", rename_async_url, "new_name");

    // Tag async. Simply have the workflow edit element generate a click on the tag element to activate tagging.
    $('#workflow-tag').click( function() {
        $('.tag-area').click();
        return false;
    });
    // Annotate async.
    async_save_text("workflow-annotation", "workflow-annotation", annotate_async_url, "new_annotation", 25, true, 4);
});

// Global state for the whole workflow
function reset() {
    if ( workflow ) {
        workflow.remove_all();
    }
    workflow = new Workflow( $("#canvas-container") );
}

function scroll_to_nodes() {
    var cv = $("#canvas-viewport");
    var cc = $("#canvas-container");
    var top, left;
    if ( cc.width() < cv.width() ) {
        left = ( cv.width() - cc.width() ) / 2;
    } else {
        left = 0;
    }
    if ( cc.height() < cv.height() ) {
        top = ( cv.height() - cc.height() ) / 2;
    } else {
        top = 0;
    }
    cc.css( { left: left, top: top } );
}

// Add a new step to the workflow by tool id
function add_node_for_tool( id, title ) {
    node = add_node( 'tool', title, id );
    $.ajax( {
        url: get_new_module_info_url,
        data: { type: "tool", tool_id: id, "_": "true" },
        global: false,
        dataType: "json",
        success: function( data ) {
            node.init_field_data( data );
        },
        error: function( x, e ) {
            var m = "error loading field data";
            if ( x.status === 0 ) {
                m += ", server unavailable";
            }
            node.error( m );
        }
    });
}

function add_node_for_module( type, title ) {
    node = add_node( type, title );
    $.ajax( {
        url: get_new_module_info_url,
        data: { type: type, "_": "true" },
        dataType: "json",
        success: function( data ) {
            node.init_field_data( data );
        },
        error: function( x, e ) {
            var m = "error loading field data"
            if ( x.status == 0 ) {
                m += ", server unavailable"
            }
            node.error( m );
        }
    });
}

// This function preloads how to display known pja's.
function display_pja(pja, node) {
    // DBTODO SANITIZE INPUTS.
    $("#pja_container").append( get_pja_form(pja, node) );
    $("#pja_container>.toolForm:last>.toolFormTitle>.buttons").click(function (){
        action_to_rem = $(this).closest(".toolForm", ".action_tag").children(".action_tag:first").text();
        $(this).closest(".toolForm").remove();
        delete workflow.active_node.post_job_actions[action_to_rem];
        workflow.active_form_has_changes = true;
    });
}

function display_pja_list(){
    return pja_list;
}

function display_file_list(node){
    addlist = "<select id='node_data_list' name='node_data_list'>";
    for (var out_terminal in node.output_terminals){
        addlist += "<option value='" + out_terminal + "'>"+ out_terminal +"</option>";
    }
    addlist += "</select>";
    return addlist;
}

function new_pja(action_type, target, node){
    if (node.post_job_actions === undefined){
        //New tool node, set up dict.
        node.post_job_actions = {};
    }
    if (node.post_job_actions[action_type+target] === undefined){
        var new_pja = {};
        new_pja.action_type = action_type;
        new_pja.output_name = target;
        node.post_job_actions[action_type+target] = null;
        node.post_job_actions[action_type+target] =  new_pja;
        display_pja(new_pja, node);
        workflow.active_form_has_changes = true;
        return true;
    } else {
        return false;
    }
}

function show_workflow_parameters(){
    var parameter_re = /\$\{.+?\}/g;
    var workflow_parameters = [];
    var wf_parm_container = $("#workflow-parameters-container");
    var wf_parm_box = $("#workflow-parameters-box");
    var new_parameter_content = "";
    var matches = [];
    $.each(workflow.nodes, function (k, node){
        var form_matches = node.form_html.match(parameter_re);
        if (form_matches){
            matches = matches.concat(form_matches);
        }
        if (node.post_job_actions){
            $.each(node.post_job_actions, function(k, pja){
                if (pja.action_arguments){
                    $.each(pja.action_arguments, function(k, action_argument){
                        var arg_matches = action_argument.match(parameter_re);
                        if (arg_matches){
                            matches = matches.concat(arg_matches);
                        }
                    });
                }
            });
            if (matches){
                $.each(matches, function(k, element){
                    if ($.inArray(element, workflow_parameters) === -1){
                        workflow_parameters.push(element);
                    }
                });
            }
        }
    });
    if (workflow_parameters && workflow_parameters.length !== 0){
        $.each(workflow_parameters, function(k, element){
            new_parameter_content += "<div>" + element.substring(2, element.length -1) + "</div>";
        });
        wf_parm_container.html(new_parameter_content);
        wf_parm_box.show();
    }else{
        wf_parm_container.html(new_parameter_content);
        wf_parm_box.hide();
    }
}

function show_form_for_tool( text, node ) {
    $('.right-content').hide();
    $("#right-content").show().html( text );
    // Add metadata form to tool.
    if (node) {
        $("#right-content").find(".toolForm:first").after( "<p><div class='metadataForm'> \
            <div class='metadataFormTitle'>Edit Step Attributes</div> \
            <div class='form-row'> \
            <label>Annotation / Notes:</label> \
                    <div style='margin-right: 10px;'> \
                    <textarea name='annotation' rows='3' style='width: 100%'>" + node.annotation + "</textarea> \
                        <div class='toolParamHelp'>Add an annotation or notes to this step; annotations are available when a workflow is viewed.</div> \
                    </div> \
            </div> \
            </div>" );
    }
    // Add step actions.
    if (node && node.type=='tool'){
        pjastr = "<p><div class='metadataForm'><div class='metadataFormTitle'>Edit Step Actions</div><div class='form-row'> \
            " + display_pja_list() + " <br/> "+ display_file_list(node) + " <div class='action-button' style='border:1px solid black;display:inline;' id='add_pja'>Create</div>\
            </div><div class='form-row'>\
            <div style='margin-right: 10px;'><span id='pja_container'></span>";
        pjastr += "<div class='toolParamHelp'>Add actions to this step; actions are applied when this workflow step completes.</div></div></div></div>";
        $("#right-content").find(".toolForm").after( pjastr );
        for (var key in node.post_job_actions){
            if (key != "undefined"){ //To make sure we haven't just deleted it.
                display_pja(node.post_job_actions[key], node);
            }
        }
        $("#add_pja").click(function (){
            new_pja($("#new_pja_list").val(),$("#node_data_list").val(), node);
        });
    }
    $("#right-content").find( "form" ).ajaxForm( {
        type: 'POST',
        dataType: 'json',
        success: function( data ) {
            workflow.active_form_has_changes = false;
            node.update_field_data( data );
            show_workflow_parameters();
        },
        beforeSubmit: function( data ) {
            data.push( { name: 'tool_state', value: node.tool_state } );
            data.push( { name: '_', value: "true" } );
        }
    }).each( function() {
        var form = this;
        $(this).find( "select[refresh_on_change='true']").change( function() {
            $(form).submit();
        });
        $(this).find( "input[refresh_on_change='true']").change( function() {
            $(form).submit();
        });
        $(this).find( ".popupmenu" ).each( function() {
            var id = $(this).parents( "div.form-row" ).attr( 'id' );
            var b = $('<a class="popup-arrow" id="popup-arrow-for-' + id + '">&#9660;</a>');
            var options = {};
            $(this).find( "button" ).each( function() {
                var name = $(this).attr( 'name' );
                var value = $(this).attr( 'value' );
                options[ $(this).text() ] = function() {
                    $(form).append( "<input type='hidden' name='"+name+"' value='"+value+"' />" ).submit();
                };
            });
            b.insertAfter( this );
            $(this).remove();
            make_popupmenu( b, options );
        });
        // Implements auto-saving based on whether the inputs change. We consider
        // "changed" to be when a field is accessed and not necessarily modified
        // because of an issue where "onchange" is not triggered when activating
        // another node, or saving the workflow.
        $(this).find("input,textarea,select").each( function() {
            $(this).bind("focus click", function() {
                workflow.active_form_has_changes = true;
            });
        });
    });
}

var close_editor = function() {
    workflow.check_changes_in_active_form();
    if ( workflow && workflow.has_changes ) {
        do_close = function() {
            window.onbeforeunload = undefined;
            window.document.location = workflow_index_url;
        };
        show_modal( "Close workflow editor",
                    "There are unsaved changes to your workflow which will be lost.",
                    {
                        "Cancel" : hide_modal,
                        "Save Changes" : function() {
                            save_current_workflow( null, do_close );
                        }
                    }, {
                        "Don't Save": do_close
                    } );
    } else {
        window.document.location = workflow_index_url;
    }
};

var save_current_workflow = function ( eventObj, success_callback ) {
    show_message( "Saving workflow", "progress" );
    workflow.check_changes_in_active_form();
    if (!workflow.has_changes) {
        hide_modal();
        if ( success_callback ) {
            success_callback();
        }
        return;
    }
    workflow.rectify_workflow_outputs();
    var savefn = function(callback) {
        $.ajax( {
            url: save_workflow_url,
            type: "POST",
            data: {
                id: workflow_id,
                workflow_data: function() { return JSON.stringify( workflow.to_simple() ); },
                "_": "true"
            },
            dataType: 'json',
            success: function( data ) {
                var body = $("<div></div>").text( data.message );
                if ( data.errors ) {
                    body.addClass( "warningmark" );
                    var errlist = $( "<ul/>" );
                    $.each( data.errors, function( i, v ) {
                        $("<li></li>").text( v ).appendTo( errlist );
                    });
                    body.append( errlist );
                } else {
                    body.addClass( "donemark" );
                }
                workflow.name = data.name;
                workflow.has_changes = false;
                workflow.stored = true;
                show_workflow_parameters();
                if ( data.errors ) {
                    show_modal( "Saving workflow", body, { "Ok" : hide_modal } );
                } else {
                    if (callback) {
                        callback();
                    }
                    hide_modal();
                }
            }
        });
    };

    // We bind to ajaxStop because of auto-saving, since the form submission ajax
    // call needs to be completed so that the new data is saved
    if (active_ajax_call) {
        $(document).bind('ajaxStop.save_workflow', function() {
            $(document).unbind('ajaxStop.save_workflow');
            savefn();
            $(document).unbind('ajaxStop.save_workflow'); // IE7 needs it here
            active_ajax_call = false;
        });
    } else {
        savefn(success_callback);
    }
};
