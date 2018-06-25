(function() {
  'use strict';

  angular.module('myBets')
  .controller('BetsController', BetsController);

  BetsController.$inject = ['$state', 'tournamentService', 'user', 'betService', 'APP_CONFIG'];

  function BetsController($state, tournamentService, user, betService, APP_CONFIG) {
    let vm = this;
    let tour = tournamentService;

    vm.inputs = {};
    vm.matchBet = {};
    vm.now = new Date().getTime();
    vm.data = tour.data;
    vm.user = user;
    vm.timeLimit = APP_CONFIG.timeLimit;
    // console.log(vm.timeLimit);
    vm.startTime = APP_CONFIG.startTime;
    // console.log(vm.startTime);
    vm.onlyOpen = $state.params.filter;

    if (vm.now < vm.startTime - vm.timeLimit) {
      if (!user.bets || !user.bets.winner || !user.bets.topScorer) {
        vm.showTopForm = true;
      } else {
        vm.showTopForm = false;
      }
    } else {
      vm.showTopForm = false;
    }

    vm.addWinnerAndScorer = function(data) {
      let now = new Date().getTime();

      if (now < vm.startTime - vm.timeLimit) {
        betService.saveWinner(data, user)
        .then(() => {
          toastr.success('Favorito salvo com sucesso!');
          vm.showTopForm = false;
        })
        .catch(error => {
          toastr.error(error.message);
        });
      } else {
        toastr.error('Már nem adhatsz le tippet a nyertesre és gólkirályra');
      }
    };

    vm.loadBets = function() {
      vm.topForm = {};
      vm.topForm.winner = user.bets.winner;
      vm.topForm.topScorer = user.bets.topScorer;
    };

    vm.updateBet = function(bet, matchId) {
      betService.saveMatchBet(bet, matchId, user)
      .then(() => {
        if (bet) {
          toastr.success("Palpite salvo com sucesso!");
        }

        vm.inputs[matchId] = false;
        vm.matchBet[matchId] = undefined;
      })
      .catch(error => {
        toastr.error(error.message);
        vm.inputs[matchId] = false;
        vm.matchBet[matchId] = undefined;
      });
    };

    vm.submitBetOnEnter = function(event, bet, matchId) {
      if (event.keyCode === 13) {
        vm.updateBet(bet, matchId);
      }
    };

    vm.loadMatchBet = function(bet, matchId) {
      if (bet) {
        vm.matchBet[matchId] = bet.home + "x" + bet.away;
      }
    };
  }
})();
