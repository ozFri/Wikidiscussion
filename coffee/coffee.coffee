$(document).ready ->
  class AppView extends Backbone.View

    events:
      "keypress #new-todo": "createOnEnter"

    createOnEnter: (event) ->
      return if event.keyCode != 13
      Propositions.create 
       name: @input.val() 
      $('#new-todo').val ''


    initialize: ->
      @input = @$('#new-todo')
      Propositions.bind 'add', @addOne
      Propositions.bind 'refresh', @addAll
      Todos.fetch()

    addOne: (todo) =>
      view = new PropositionView(model: todo)
      @$('#todo-list').append(view.render())

    addAll: =>
      Todos.each @addOne

  class Proposition extends Backbone.Model
    defaults:
      name: ""
      agree_votes: 0
      disagree_votes: 0
      abstain_votes: 0
      negative: []
      positive: []

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

  window.Propositions = new PropositionList

  class PropositionView extends Backbone.View
    tagName: 'li'

    render: ->
      name = @model.get('name')
      agree_votes = @model.get('agree_votes')
      abstain_votes = @model.get('abstain_votes')
      disagree_votes = @model.get('disagree_votes')
      $(@el).html(name + " agree:" + agree_votes + " disagree:" + disagree_votes + " abstained:" + abstain_votes +  "<button id = agree>agree</button>" + "<button id = disagree>disagree</button>" + "<button id = abstain>abstain</button>")
      @el
       
      

  App = new AppView(el: $('#content'))
