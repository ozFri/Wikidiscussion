$(document).ready ->
  class AppView extends Backbone.View

  el_tag = "#todoapp"
  el: $(el_tag)

    events:
      "keypress #new-todo": "createOnEnter"
      "click .todo-clear a" : "clearCompleted"

## creates a proposition in propositionlist out of the text in newtodo
    createOnEnter: (event) ->
      return if event.keyCode != 13
      Propositions.create
       name: @input.val()
      $('#new-todo').val ''

	

    clearCompleted: ->
      _.each(Todos.done(), (todo) ->
             todo.clear()
      )
      return false

##something I don't fully understand
    initialize: ->
      @input = @$('#new-todo')
      Propositions.bind 'add', @addOne
      Propositions.bind 'reset', @addAll
      Propositions.fetch()
	



## adds the proposition content to the proposition window
    addOne: (todo) =>
      view = new PropositionView(model: todo)
      @$('#todo-list').append(view.render())
## add the content of all the propositions in propositiontree
    addAll: =>
      Propositions.each @addOne

	

    newAttributes: ->
        return {
            content: @input.val(),
            done:    false
        }




## "definition" of proposition
  class Proposition extends Backbone.Model
    defaults:
      name: "" #the proposition itself
      agree_votes: 0 #votes of course
      disagree_votes: 0
      abstain_votes: 0
      negative: [] #list of propositions that strenghten the proposition
      positive: [] #list of propositions that weaken the proposition
      done: false
	
    toggle: ->
        @save({ done: !@get("done") })

    clear: ->
       @destroy()
       @view.remove()

#function that take a vote type, and add 1 to the value of the related vote counter
    vote: (vote_type) =>
      if vote_type is "agree"
        @agree_votes += 1
      else if vote_type is "disagree"
        @disagree_votes += 1
      else if vote_type is "abstain"
        @abstain_votes += 1

  class PropositionList extends Backbone.Collection
    model: Proposition

    localStorage: new Store('Propositions')
	
    done: ->
        return @filter( getDone )

  window.Propositions = new PropositionList

  class PropositionView extends Backbone.View
    tagName: 'li'
  
    template: _.template( $("#item-template").html() )
 
    events:
      "click span.todo-destroy"   : "clear"

    initialize: ->
        @model.bind('change', this.render);
        @model.view = this;

    render: =>
      this.$(@el).html( @template(@model.toJSON()) )
      @setContent()
      return this
#      name = @model.get('name')
#      agree_votes = @model.get('agree_votes')
#      abstain_votes = @model.get('abstain_votes')
#      disagree_votes = @model.get('disagree_votes')
#      $(@el).html(name +
#       "&nbsp;&nbsp;<|>&nbsp;&nbsp; agree:" + agree_votes +
#       " disagree:" + disagree_votes +
#       " abstained:" + abstain_votes +
#       "<button id = \"agree\">agree</button>" +
#       "<button id = disagree>disagree</button>" +
#       "<button id = abstain>abstain</button>" +
#       "<div>
#<input id=\"positive\" placeholder=\"Enter reinforcing proposition\" type=\"text\" />
#<input id=\"negative\" placeholder=\"Enter refuting proposition\" type=\"text\" />

#</div>")
#      @el
     	  
	

    setContent: ->
        content = @model.get("content")
        this.$(".todo-content").text(content)
        @input = this.$(".todo-input");
        @input.bind("blur", @close);
        @input.val(content);

    toggleDone: ->
        @model.toggle()
	
    remove: ->
       $(@el).remove()

    clear: () ->
       @model.clear()

  App = new AppView(el: $('#content'))
