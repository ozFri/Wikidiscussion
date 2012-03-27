(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $(document).ready(function() {
    var App, AppView, Proposition, PropositionList, PropositionView;
    AppView = (function(_super) {

      __extends(AppView, _super);

      function AppView() {
        this.addAll = __bind(this.addAll, this);
        this.addOne = __bind(this.addOne, this);
        AppView.__super__.constructor.apply(this, arguments);
      }

      AppView.prototype.events = {
        "keypress #new-todo": "createOnEnter"
      };

      AppView.prototype.createOnEnter = function(event) {
        if (event.keyCode !== 13) return;
        Propositions.create({
          name: this.input.val()
        });
        return $('#new-todo').val('');
      };

      AppView.prototype.initialize = function() {
        this.input = this.$('#new-todo');
        Propositions.bind('add', this.addOne);
        Propositions.bind('refresh', this.addAll);
        return Todos.fetch();
      };

      AppView.prototype.addOne = function(todo) {
        var view;
        view = new PropositionView({
          model: todo
        });
        return this.$('#todo-list').append(view.render());
      };

      AppView.prototype.addAll = function() {
        return Todos.each(this.addOne);
      };

      return AppView;

    })(Backbone.View);
    Proposition = (function(_super) {

      __extends(Proposition, _super);

      function Proposition() {
        this.vote = __bind(this.vote, this);
        Proposition.__super__.constructor.apply(this, arguments);
      }

      Proposition.prototype.defaults = {
        name: "",
        agree_votes: 0,
        disagree_votes: 0,
        abstain_votes: 0,
        negative: [],
        positive: []
      };

      Proposition.prototype.vote = function(vote_type) {
        if (vote_type === "agree") {
          return this.agree_votes += 1;
        } else if (vote_type === "disagree") {
          return this.disagree_votes += 1;
        } else if (vote_type === "abstain") {
          return this.abstain_votes += 1;
        }
      };

      return Proposition;

    })(Backbone.Model);
    PropositionList = (function(_super) {

      __extends(PropositionList, _super);

      function PropositionList() {
        PropositionList.__super__.constructor.apply(this, arguments);
      }

      PropositionList.prototype.model = Proposition;

      PropositionList.prototype.localStorage = new Store('Propositions');

      return PropositionList;

    })(Backbone.Collection);
    window.Propositions = new PropositionList;
    PropositionView = (function(_super) {

      __extends(PropositionView, _super);

      function PropositionView() {
        PropositionView.__super__.constructor.apply(this, arguments);
      }

      PropositionView.prototype.tagName = 'li';

      PropositionView.prototype.render = function() {
        var name;
        name = this.model.get('name');
        $(this.el).html(name);
        return this.el;
      };

      return PropositionView;

    })(Backbone.View);
    return App = new AppView({
      el: $('#content')
    });
  });

}).call(this);
