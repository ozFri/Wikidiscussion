# An example Backbone application contributed by
# [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
# [LocalStorage adapter](backbone-localstorage.html)
# to persist Backbone models within your browser.
#
# This [CoffeeScript](http://jashkenas.github.com/coffee-script/) variation has been provided by [Jason Giedymin](http://jasongiedymin.com/).
#
# Note: two things you will notice with my CoffeeScript are that I prefer to
# use four space inde:nts and prefer to use `()` for all functions.

# Load the application once the DOM is ready, using a `jQuery.ready` shortcut.
$ ->
    ### Todo Model ###

    # Our basic **Todo** model has `content`, `order`, and `done` attributes.
    class Proposition extends StackMob.Model
        # Default attributes for the todo.
        defaults:
            content: "empty todo..."
            done: false
            agree_votes: 0
            disagree_votes: 0
            abstain_votes: 0
            negative: []
            positive: []
   #         i: 1
        vote: (vote_type) ->
          if vote_type is "agree"
            @save (agree_votes: @get("agree_votes") + 1)
          else if vote_type is "disagree"
            @save (disagree_votes: @get("disagree_votes") + 1)
          else if vote_type is "abstain"
            @save (abstain_votes: @get("abstain_votes") + 1)

        # Ensure that each todo created has `content`.
        initialize: ->
            if !@get("content")
                @set({ "content": @defaults.content })

        # Toggle the `done` state of this todo item.
        toggle: ->
            @save({ done: !@get("done") })

        # Remove this Todo from *localStorage* and delete its view.
        clear: ->
            @destroy()
            @view.remove()

        savepos: (el) ->
           @appendAndSave "positive", (@get('positive') + el)

        saveneg: (el) ->
           @save (negative: @get('negative') + el)
    ### Todo Collection ###

    # The collection of todos is backed by *localStorage* instead of a remote
    # server.
    class PropositionList extends StackMob.Collection

        # Reference to this collection's model.
        model: Proposition

        # Save all of the todo items under the `"todos"` namespace.
        localStorage: new Store("todos")

        # Attribute getter/setter
        getDone = (todo) ->
            return todo.get("done")

        # Filter down the list of all todo items that are finished.
        done: ->
            return @filter( getDone )

        # Filter down the list to only todo items that are still not finished.
        remaining: ->
            return @without.apply( this, @done() )

        # We keep the Todos in sequential order, despite being saved by unordered
        # GUID in the database. This generates the next order number for new items.
        nextOrder: ->
            return 1 if !@length
            return @last().get('order') + 1

        # Todos are sorted by their original insertion order.
        comparator: (todo) ->
            return todo.get("order")

    ### Todo Item View ###

    # The DOM element for a todo item...

    

    class PropositionView extends Backbone.View

        #... is a list tag.
        tagName: "li"

        # Cache the template function for a single item.
        template: _.template( $("#item-template").html() )

        # The DOM events specific to an item.
        events:
            "click .check" : "toggleDone",
            "dblclick div.todo-content" : "edit",
            "click span.todo-destroy"   : "clear",
            "keypress .todo-input" : "updateOnEnter"
            "click .agree" : "voteAgree"
            "click .disagree" : "voteDisagree"
            "click .abstained" : "voteAbstained"
            "keypress .positive"    : "pushPosOnEnter"
            "keypress .negative"    : "pushNegOnEnter"
#            "keypress .positive" : "createOnEnterP" ,
#            "keypress .negative" : "createOnEnterN"
        # The TodoView listens for changes to its model, re-rendering. Since there's
        # a one-to-one correspondence between a **Todo** and a **TodoView** in this
        # app, we set a direct reference on the model for convenience.
        initialize: ->
            @model.bind('change', this.render);
            @model.view = this;
            @inputp = this.$(".positive")
            @inputn = this.$(".negative")
        # Re-render the contents of the todo item.
        render: =>
            content = "<div id=" + @model.get('content') + "></div>"
            positivelist = "<ul>" + @model.get('positive') + "</ul>"
            negativelist = "<ul>" + @model.get('negative') + "</ul>"
            agree_votes = @model.get('agree_votes')
            disagree_votes = @model.get('disagree_votes')
            abstain_votes = @model.get('abstain_votes')
            this.$(@el).html( content + @template(@model.toJSON()) + " agree votes: " + agree_votes + " disagree votes: " + disagree_votes + " abstain votes: " + abstain_votes + "<ul>supporting propositions:</ul>" + positivelist + "<ul>opposing propositions:</ul>" + negativelist )
            @setContent()
            return this



        # To avoid XSS (not that it would be harmful in this particular app),
        # we use `jQuery.text` to set the contents of the todo item.
        setContent: ->
            content = @model.get("content")
            this.$(".todo-content").text(content)
            @input = this.$(".todo-input");
            @input.bind("blur", @close);
            @input.val(content);
            @inputp = this.$(".positive";)
            @inputp.bind("blur", @pushPosOnEnter);
            @inputn = this.$(".negative";)
            @inputn.bind("blur", @pushNegOnEnter);
        # Toggle the `"done"` state of the model.
        toggleDone: ->
            @model.toggle()

        # Switch this view into `"editing"` mode, displaying the input field.
        edit: =>
            this.$(@el).addClass("editing")
            @input.focus()

        # Close the `"editing"` mode, saving changes to the todo.
        close: =>
            @model.save({ content: @input.val() })
            $(@el).removeClass("editing")

        voteAgree: =>
            @model.vote("agree")

        voteDisagree: =>
            @model.vote("disagree")

        voteAbstained: =>
            @model.vote("abstain")


        # If you hit `enter`, we're through editing the item.
        updateOnEnter: (e) =>
            @close() if e.keyCode is 13

        pushPosOnEnter: (e) =>
            if e.keyCode != 13 
               return
            Propositions.create( @newAttributesP() ) 
            @model.savepos ("<a href =\"#" + @inputp.val() + "\"><ul>" + @inputp.val() + "</a></ul>") 
            @inputp.val('')
      #      alert ((i) for i in @model.get ("positive"))
              
        pushNegOnEnter: (e) =>
            if e.keyCode != 13 
               return
            Propositions.create( @newAttributesN() )
            @model.saveneg ("<a href=\"#" + @inputn.val() + "\"><ul>" + @inputn.val() + "</a></ul>") 
            @inputn.val('')
            
     #       alert ((i) for i in @model.get ("negative"))
     # Remove this view from the DOM.
        remove: ->
            $(@el).remove()

        # Remove the item, destroy the model.
        clear: () ->
            @model.clear()


#        createOnEnterP: (e) ->
#            return if (e.keyCode != 13)


#        createOnEnterN: (e) ->
#            return if (e.keyCode != 13)

        
       
        newAttributesP: ->
 #that was added to observe @inputp           alert @inputp.get("val()")
            return {
                content: @inputp.val(),
                order: Propositions.nextOrder(),
                done: false
            }

        newAttributesN: ->
            return {
                content: @inputn.val(),
                order: Propositions.nextOrder(),
                done: false
            }

    ### The Application ###

    # Our overall **AppView** is the top-level piece of UI.
    class AppView extends Backbone.View
        # Instead of generating a new element, bind to the existing skeleton of
        # the App already present in the HTML.
        el_tag = "#todoapp"
        el: $(el_tag)        


        # Our template for the line of statistics at the bottom of the app.
        statsTemplate: _.template( $("#stats-template").html() )

        # Delegated events for creating new items, and clearing completed ones.
        events:
            "keypress #new-todo" : "createOnEnter",
            "keyup #new-todo" : "showTooltip",
            "click .todo-clear a" : "clearCompleted" ,



        # At initialization we bind to the relevant events on the `Todos`
        # collection, when items are added or changed. Kick things off by
        # loading any preexisting todos that might be saved in *localStorage*.
        initialize: ->
            @input = this.$("#new-todo")

            Propositions.bind("add", @addOne)
            Propositions.bind("reset", @addAll)
            Propositions.bind("all", @render)

            Propositions.fetch()

        # Re-rendering the App just means refreshing the statistics -- the rest
        # of the app doesn't change.
        render: =>
            this.$('#todo-stats').html( @statsTemplate({
                total: Propositions.length,
                done: Propositions.done().length,
                remaining: Propositions.remaining().length
            }))

        # Add a single todo item to the list by creating a view for it, and
        # appending its element to the `<ul>`.
        addOne: (todo) =>
            view = new PropositionView( {model: todo} )
            this.$("#todo-list").append( view.render().el )

        # Add all items in the **Todos** collection at once.
        addAll: =>
            Propositions.each(@addOne);

        # Generate the attributes for a new Todo item.
        newAttributes: ->
            return {
                content: @input.val(),
                order: Propositions.nextOrder(),
                done: false
            }

        # If you hit return in the main input field, create new **Todo** model,
        # persisting it to *localStorage*.
        createOnEnter: (e) ->
            return if (e.keyCode != 13)
            Propositions.create( @newAttributes() )
            @input.val('')



        # Clear all done todo items, destroying their models.
        clearCompleted: ->
            _.each(Propositions.done(), (todo) ->
                todo.clear()
            )
            return false

        # Lazily show the tooltip that tells you to press `enter` to save
        # a new todo item, after one second.
        showTooltip: (e) ->
            tooltip = this.$(".ui-tooltip-top")
            val = @input.val()
            tooltip.fadeOut()
            clearTimeout(@tooltipTimeout) if (@tooltipTimeout)
            return if (val is '' || val is @input.attr("placeholder"))
            
            show = () ->
                tooltip.show().fadeIn()
            @tooltipTimeout = _.delay(show, 1000)

    # Create our global collection of **Todos**.
    # Note: I've actually chosen not to export globally to `window`.
    # Original documentation has been left intact.
    Propositions = new PropositionList
    App = new AppView()


