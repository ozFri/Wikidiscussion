(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(document).ready(function() {
    var App, AppView, Proposition, PropositionList, PropositionView, el_tag,
      _this = this;
    AppView = (function(_super) {

      __extends(AppView, _super);

      function AppView() {
        AppView.__super__.constructor.apply(this, arguments);
      }

      return AppView;

    })(Backbone.View);
    el_tag = "#todoapp";
    ({
      el: $(el_tag)({
        events: {
          "keypress #new-todo": "createOnEnter",
          "click .todo-clear a": "clearCompleted"
        },
        createOnEnter: function(event) {
          if (event.keyCode !== 13) return;
          Propositions.create({
            name: this.input.val()
          });
          return $('#new-todo').val('');
        },
        clearCompleted: function() {
          _.each(Todos.done(), function(todo) {
            return todo.clear();
          });
          return false;
        },
        initialize: function() {
          this.input = this.$('#new-todo');
          Propositions.bind('add', this.addOne);
          Propositions.bind('reset', this.addAll);
          return Propositions.fetch();
        },
        addOne: function(todo) {
          var view;
          view = new PropositionView({
            model: todo
          });
          return _this.$('#todo-list').append(view.render());
        },
        addAll: function() {
          return Propositions.each(_this.addOne);
        },
        newAttributes: function() {
          return {
            content: this.input.val(),
            done: false
          };
        }
      })
    });
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
        positive: [],
        done: false
      };

      Proposition.prototype.toggle = function() {
        return this.save({
          done: !this.get("done")
        });
      };

      Proposition.prototype.clear = function() {
        this.destroy();
        return this.view.remove();
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

      PropositionList.prototype.done = function() {
        return this.filter(getDone);
      };

      return PropositionList;

    })(Backbone.Collection);
    window.Propositions = new PropositionList;
    PropositionView = (function(_super) {

      __extends(PropositionView, _super);

      function PropositionView() {
        this.render = __bind(this.render, this);
        PropositionView.__super__.constructor.apply(this, arguments);
      }

      PropositionView.prototype.tagName = 'li';

      PropositionView.prototype.template = _.template($("#item-template").html());

      PropositionView.prototype.events = {
        "click span.todo-destroy": "clear"
      };

      PropositionView.prototype.initialize = function() {
        this.model.bind('change', this.render);
        return this.model.view = this;
      };

      PropositionView.prototype.render = function() {
        this.$(this.el).html(this.template(this.model.toJSON()));
        this.setContent();
        return this;
      };

      PropositionView.prototype.setContent = function() {
        var content;
        content = this.model.get("content");
        this.$(".todo-content").text(content);
        this.input = this.$(".todo-input");
        this.input.bind("blur", this.close);
        return this.input.val(content);
      };

      PropositionView.prototype.toggleDone = function() {
        return this.model.toggle();
      };

      PropositionView.prototype.remove = function() {
        return $(this.el).remove();
      };

      PropositionView.prototype.clear = function() {
        return this.model.clear();
      };

      return PropositionView;

    })(Backbone.View);
    return App = new AppView({
      el: $('#content')
    });
  });

}).call(this);
