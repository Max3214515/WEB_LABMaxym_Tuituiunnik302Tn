$(document).ready(function() {
    // Конфігурація гри
    const gameConfig = {
        maxNumber: 20,
        initialTime: 60,
        minFontSize: 16,
        maxFontSize: 24,
        fontSizeStep: 2,
        maxStatsRecords: 10
    };
    
    // Стан гри
    const gameState = {
        currentNumber: 1,
        timeRemaining: gameConfig.initialTime,
        attempts: 0,
        timerInterval: null,
        isGameActive: false,
        stats: []
    };
    
    // Ініціалізація гри
    initGame();
    
    // Основні функції гри
    function initGame() {
        resetGameState();
        createGameBoard();
        startTimer();
        updateUI();
        loadGameStats();
    }
    
    function resetGameState() {
        clearInterval(gameState.timerInterval);
        gameState.currentNumber = 1;
        gameState.timeRemaining = gameConfig.initialTime;
        gameState.attempts = 0;
        gameState.isGameActive = true;
    }
    
    function createGameBoard() {
        const $gameBoard = $('.game-board').empty();
        const numbers = generateShuffledNumbers();
        
        numbers.forEach(number => {
            $gameBoard.append(createNumberElement(number));
        });
        
        $('.number').off('click').on('click', handleNumberClick);
    }
    
    function generateShuffledNumbers() {
        return Array.from({ length: gameConfig.maxNumber }, (_, i) => i + 1)
                   .sort(() => Math.random() - 0.5);
    }
    
    function createNumberElement(number) {
        const fontSize = getRandomFontSize();
        const color = getRandomColor();
        
        return $('<div>')
            .addClass('number')
            .text(number)
            .css({ 'font-size': `${fontSize}px`, color })
            .attr('data-number', number);
    }
    
    function getRandomFontSize() {
        const sizes = [];
        for (let i = gameConfig.minFontSize; i <= gameConfig.maxFontSize; i += gameConfig.fontSizeStep) {
            sizes.push(i);
        }
        return sizes[Math.floor(Math.random() * sizes.length)];
    }
    
    function getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    }
    
    function handleNumberClick() {
        if (!gameState.isGameActive) return;
        
        const $number = $(this);
        const selectedNumber = parseInt($number.attr('data-number'));
        
        gameState.attempts++;
        
        if (selectedNumber === gameState.currentNumber) {
            handleCorrectSelection($number);
        } else {
            handleWrongSelection($number);
        }
    }
    
    function handleCorrectSelection($number) {
        $number.addClass('selected').off('click');
        gameState.currentNumber++;
        
        updateUI();
        
        if (gameState.currentNumber > gameConfig.maxNumber) {
            endGame(true);
        }
    }
    
    function handleWrongSelection($number) {
        $number.addClass('wrong');
        showFeedbackMessage('Не вірна цифра! Спробуйте ще раз.', 'error');
        
        setTimeout(() => $number.removeClass('wrong'), 500);
    }
    
    function showFeedbackMessage(message, type) {
        const $info = $('.game-info')
            .text(message)
            .css('color', type === 'error' ? '#f44336' : '#333');
        
        if (type === 'error') {
            setTimeout(() => updateUI(), 1500);
        }
    }
    
    function startTimer() {
        gameState.timerInterval = setInterval(() => {
            gameState.timeRemaining--;
            updateTimerUI();
            
            if (gameState.timeRemaining <= 0) {
                endGame(false);
            }
        }, 1000);
    }
    
    function updateUI() {
        updateGameInfoUI();
        updateTimerUI();
    }
    
    function updateGameInfoUI() {
        showFeedbackMessage(`Знайдіть число ${gameState.currentNumber}`, 'info');
    }
    
    function updateTimerUI() {
        const $timer = $('.timer');
        let timerColor;
        
        if (gameState.timeRemaining <= 10) {
            timerColor = '#d50000';
        } else if (gameState.timeRemaining <= 30) {
            timerColor = '#ff6d00';
        } else {
            timerColor = '#2e7d32';
        }
        
        $timer.text(`Час: ${gameState.timeRemaining} сек.`).css('color', timerColor);
    }
    
    function endGame(isSuccess) {
        gameState.isGameActive = false;
        clearInterval(gameState.timerInterval);
        $('.number').off('click');
        
        if (isSuccess) {
            handleGameSuccess();
        } else {
            showModal('#timeoutModal');
        }
        
        updateStatsTable();
    }
    
    function handleGameSuccess() {
        const timeUsed = gameConfig.initialTime - gameState.timeRemaining;
        saveGameResult(timeUsed);
        
        $('#congratsModal h3').text(`Вітаємо! Ви знайшли всі числа за ${timeUsed} секунд`);
        $('#congratsModal p').text(`Кількість спроб: ${gameState.attempts}`);
        showModal('#congratsModal');
    }
    
    function loadGameStats() {
        const stats = localStorage.getItem('numberGameStats');
        gameState.stats = stats ? JSON.parse(stats) : [];
    }
    
    function saveGameResult(time) {
        gameState.stats.push({
            time: time,
            attempts: gameState.attempts,
            date: new Date().toLocaleString()
        });
        
        gameState.stats.sort((a, b) => a.time - b.time);
        
        if (gameState.stats.length > gameConfig.maxStatsRecords) {
            gameState.stats = gameState.stats.slice(0, gameConfig.maxStatsRecords);
        }
        
        localStorage.setItem('numberGameStats', JSON.stringify(gameState.stats));
    }
    
    function updateStatsTable() {
        const $tbody = $('#statsTable tbody').empty();
        
        if (gameState.stats.length === 0) {
            $tbody.append('<tr><td colspan="3">Немає записів</td></tr>');
            return;
        }
        
        gameState.stats.forEach((record, index) => {
            const $row = $('<tr>')
                .append($('<td>').text(record.date))
                .append($('<td>').text(`${record.time} сек.`))
                .append($('<td>').text(record.attempts));
            
            if (index === 0) $row.addClass('best-score');
            
            $tbody.append($row);
        });
    }
    
    function showModal(selector) {
        $(selector).css('display', 'flex');
    }
    
    function hideModal(selector) {
        $(selector).css('display', 'none');
    }
    
    // Обробники подій
    $('#restartGame, .modal-restart').on('click', initGame);
    $('.modal-close').on('click', function() {
        hideModal($(this).closest('.modal'));
    });
    
    // Закриття модального вікна при кліку на затемнений фон
    $('.modal').on('click', function(e) {
        if (e.target === this) hideModal($(this));
    });
});