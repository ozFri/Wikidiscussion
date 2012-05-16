(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    /* Todo Model
    */
    var App, AppView, Proposition, PropositionList, PropositionView, Propositions;
    Proposition = (function(_super) {

      __extends(Proposition, _super);

      function Proposition() {
        Proposition.__super__.constructor.apply(this, arguments);
      }

      Proposition.prototype.defaults = {
        content: "empty todo...",
        done: false,
        agree_votes: 0,
        disagree_votes: 0,
        abstain_votes: 0,
        negative: [],
        positive: []
      };

      Proposition.prototype.vote = function(vote_type) {
        if (vote_type === "agree") {
          return this.save({
            agree_votes: this.get("agree_votes") + 1
          });
        } else if (vote_type === "disagree") {
          return this.save({
            disagree_votes: this.get("disagree_votes") + 1
          });
        } else if (vote_type === "abstain") {
          return this.save({
            abstain_votes: this.get("abstain_votes") + 1
          });
        }
      };

      Proposition.prototype.initialize = function() {
        if (!this.get("content")) {
          return this.set({
            "content": this.defaults.content
          });
        }
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

      Proposition.prototype.savepos = function(el) {
        var a;
        a = this.get('positive');
        a.push(el);
        return this.save({
          positive: a
        });
      };

      Proposition.prototype.saveneg = function(el) {
        var a;
        a = this.get('negative');
        a.push(el);
        return this.save({
          negative: a
        });
      };

      return Proposition;

    })(StackMob.Model);
    /* Todo Collection
    */
    PropositionList = (function(_super) {
      var getDone;

      __extends(PropositionList, _super);

      function PropositionList() {
        PropositionList.__super__.constructor.apply(this, arguments);
      }

      PropositionList.prototype.model = Proposition;

      getDone = function(todo) {
        return todo.get("done");
      };

      PropositionList.prototype.done = function() {
        return this.filter(getDone);
      };

      PropositionList.prototype.remaining = function() {
        return this.without.apply(this, this.done());
      };

      PropositionList.prototype.nextOrder = function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
      };

      PropositionList.prototype.comparator = function(todo) {
        return todo.get("order");
      };

      return PropositionList;

    })(StackMob.Collection);
    /* Todo Item View
    */
    PropositionView = (function(_super) {

      __extends(PropositionView, _super);

      function PropositionView() {
        this.pushNegOnEnter = __bind(this.pushNegOnEnter, this);
        this.updateOnEnter = __bind(this.updateOnEnter, this);
        this.voteAbstained = __bind(this.voteAbstained, this);
        this.voteDisagree = __bind(this.voteDisagree, this);
        this.voteAgree = __bind(this.voteAgree, this);
        this.close = __bind(this.close, this);
        this.edit = __bind(this.edit, this);
        this.render = __bind(this.render, this);
        PropositionView.__super__.constructor.apply(this, arguments);
      }

      PropositionView.prototype.tagName = "li";

      PropositionView.prototype.template = _.template($("#item-template").html());

      PropositionView.prototype.events = {
        "click .check": "toggleDone",
        "dblclick div.todo-content": "edit",
        "click span.todo-destroy": "clear",
        "keypress .todo-input": "updateOnEnter",
        "click .agree": "voteAgree",
        "click .disagree": "voteDisagree",
        "click .abstained": "voteAbstained",
        "keypress .positive": "pushPosOnEnter",
        "keypress .negative": "pushNegOnEnter"
      };

      PropositionView.prototype.initialize = function() {
        this.model.bind('change', this.render);
        this.model.view = this;
        this.inputp = this.$(".positive");
        return this.inputn = this.$(".negative");
      };

      PropositionView.prototype.render = function() {
        var abstain_votes, abv, agree_votes, agv, content, dgv, disagree_votes, negativelist, opp, positivelist, sop;
        content = "<div id=" + this.model.get('content') + "></div>";
        positivelist = "<ul>" + this.model.get('positive') + "</ul>";
        negativelist = "<ul>" + this.model.get('negative') + "</ul>";
        agree_votes = this.model.get('agree_votes');
        disagree_votes = this.model.get('disagree_votes');
        abstain_votes = this.model.get('abstain_votes');
        agv = " agree votes: <font color = \"green\">";
        dgv = "</font>disagree votes: <font color = \"red\">";
        abv = "</font> abstain votes: <font color = \"yellow\">";
        sop = "</font> <ul>supporting propositions:</ul>";
        opp = "<ul>opposing propositions:</ul>";
        this.$(this.el).html(content + this.template(this.model.toJSON()) + agv + agree_votes + dgv + disagree_votes + abv + abstain_votes + sop + positivelist + opp + negativelist);
        this.setContent();
        return this;
      };

      PropositionView.prototype.setContent = function() {
        var content;
        content = this.model.get("content");
        this.$(".todo-content").text(content);
        this.input = this.$(".todo-input");
        this.input.bind("blur", this.close);
        this.input.val(content);
        this.inputp = this.$(".positive");
        this.inputp.bind("blur", this.pushPosOnEnter);
        this.inputn = this.$(".negative");
        return this.inputn.bind("blur", this.pushNegOnEnter);
      };

      PropositionView.prototype.toggleDone = function() {
        return this.model.toggle();
      };

      PropositionView.prototype.edit = function() {
        this.$(this.el).addClass("editing");
        return this.input.focus();
      };

      PropositionView.prototype.close = function() {
        this.model.save({
          content: this.input.val()
        });
        return $(this.el).removeClass("editing");
      };

      PropositionView.prototype.voteAgree = function() {
        return this.model.vote("agree");
      };

      PropositionView.prototype.voteDisagree = function() {
        return this.model.vote("disagree");
      };

      PropositionView.prototype.voteAbstained = function() {
        return this.model.vote("abstain");
      };

      PropositionView.prototype.updateOnEnter = function(e) {
        if (e.keyCode === 13) return this.close();
      };

      PropositionView.prototype.pushPosOnEnter = function(e) {
        if (e.keyCode !== 13) return;
        Propositions.create(this.newAttributesP());
        this.model.savepos("<a href =\"#" + this.inputp.val() + "\"><ul>" + this.inputp.val() + "</a></ul>");
        return this.inputp.val('');
      };

      PropositionView.prototype.pushNegOnEnter = function(e) {
        if (e.keyCode !== 13) return;
        Propositions.create(this.newAttributesN());
        this.model.saveneg("<a href=\"#" + this.inputn.val() + "\"><ul>" + this.inputn.val() + "</a></ul>");
        return this.inputn.val('');
      };

      PropositionView.prototype.remove = function() {
        return $(this.el).remove();
      };

      PropositionView.prototype.clear = function() {
        return this.model.clear();
      };

      PropositionView.prototype.newAttributesP = function() {
        return {
          content: this.inputp.val(),
          order: Propositions.nextOrder(),
          done: false
        };
      };

      PropositionView.prototype.newAttributesN = function() {
        return {
          content: this.inputn.val(),
          order: Propositions.nextOrder(),
          done: false
        };
      };

      return PropositionView;

    })(Backbone.View);
    /* The Application
    */
    AppView = (function(_super) {
      var el_tag;

      __extends(AppView, _super);

      function AppView() {
        this.addAll = __bind(this.addAll, this);
        this.addOne = __bind(this.addOne, this);
        this.render = __bind(this.render, this);
        AppView.__super__.constructor.apply(this, arguments);
      }

      el_tag = "#todoapp";

      AppView.prototype.el = $(el_tag);

      AppView.prototype.statsTemplate = _.template($("#stats-template").html());

      AppView.prototype.events = {
        "keypress #new-todo": "createOnEnter",
        "keyup #new-todo": "showTooltip",
        "click .todo-clear a": "clearCompleted"
      };

      AppView.prototype.initialize = function() {
        this.input = this.$("#new-todo");
        Propositions.bind("add", this.addOne);
        Propositions.bind("reset", this.addAll);
        Propositions.bind("all", this.render);
        return Propositions.fetch();
      };

      AppView.prototype.render = function() {
        return this.$('#todo-stats').html(this.statsTemplate({
          total: Propositions.length,
          done: Propositions.done().length,
          remaining: Propositions.remaining().length
        }));
      };

      AppView.prototype.addOne = function(todo) {
        var view;
        view = new PropositionView({
          model: todo
        });
        return this.$("#todo-list").append(view.render().el);
      };

      AppView.prototype.addAll = function() {
        return Propositions.each(this.addOne);
      };

      AppView.prototype.newAttributes = function() {
        return {
          content: this.input.val(),
          order: Propositions.nextOrder(),
          done: false
        };
      };

      AppView.prototype.createOnEnter = function(e) {
        if (e.keyCode !== 13) return;
        Propositions.create(this.newAttributes());
        return this.input.val('');
      };

      AppView.prototype.clearCompleted = function() {
        _.each(Propositions.done(), function(todo) {
          return todo.clear();
        });
        return false;
      };

      AppView.prototype.showTooltip = function(e) {
        var show, tooltip, val;
        tooltip = this.$(".ui-tooltip-top");
        val = this.input.val();
        tooltip.fadeOut();
        if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
        if (val === '' || val === this.input.attr("placeholder")) return;
        show = function() {
          return tooltip.show().fadeIn();
        };
        return this.tooltipTimeout = _.delay(show, 1000);
      };

      return AppView;

    })(Backbone.View);
    Propositions = new PropositionList;
    return App = new AppView();
  });

}).call(this);
