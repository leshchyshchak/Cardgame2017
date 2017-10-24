Мультиплеерная карточная игра на [Phaser.js](https://phaser.io/), [Node.js](https://nodejs.org/) и [Eureca.io](http://eureca.io/).  
Тестовая версия - [durak.herokuapp.com](https://durak.herokuapp.com/).  
Документация (WIP) - [клиент](https://durak.herokuapp.com/doc/client), [сервер](https://durak.herokuapp.com/doc/server).  
[Правила игры (примерные)](http://www.gambiter.ru/durak/item/69-igra-durak-pravila.html). Реализован переводной и подкидной варианты.

## Установка  

1. Клонировать `git clone https://github.com/unshame/Cardgame2017.git`    
3. Установить [node.js](https://nodejs.org/en/)     
4. Установить необходимые библиотеки через Node.js command prompt в папку с репозиторием:  
    * `cd директорияУстановкиРепозитория`  
    * `npm i`  
9. Установить модули для разработки: `npm run dev`  
Это установит gulp, jsdoc и plato (об этом далее).
5. Запустить сервер через Node.js command prompt: `node server`    
7. В браузере открыть `localhost:5000`  
8. Должно быть так:   
![Menu](https://i.imgur.com/kKb8Hfr.png  "Menu")  
![Gameplay](https://i.imgur.com/CkgYyii.jpg  "Gameplay")  
И если нажать F12:  
![DevConsole](https://i.imgur.com/HyQXwbl.png "F12 Developer Console")  

## Отладка и тестирование

### Параметры запуска сервера  
`node server -param1 value -param2 -param3` и т.д.  
Параметры:  
 * `--debug [string]`, `-d [string]` - включает дебаг сообщения в консоли, опционально можно указать уровень сообщений (`silly, debug, info, notice, warn, error`, по умолчанию `debug` с флагом и `notice` без флага)  
 * `--port number` - порт сервера игры (если стандартный 5000 занят)
 * `--testing [number]`, `--test [number]`, `-t [number]` - запускает тесты вместо обычного режима, опционально можно указать длительность тестов (2000мс по-умолчанию)  
 * `--dt number`, `--decisiontime number` - устанавливает время ответа ботов  

 Параметры настройки быстрой игры:  
 * `--bots number`, `-b number` - игра будет запускаться с этим кол-вом ботов (по-умолчанию 0)  
 * `--players number`, `-p number` - игра будет ожидать этого кол-ва игроков перед запуском (по-умолчанию 4)  
 * `--transfer` - можно переводить карты  
 * `--followup` - убирает ограничение подбрасывания карт кол-вом карт в руке защищающегося в начале хода  
 * `--attack` - убирает ограничение кол-ва атакующих  
 * `--freeforall`, `--ffa` - все атакующие игроки ходят одновременно  

### Тестирование сервера 
Тесты очень примитивные, все, что они делают, это прогоняют игру с ботами без задержки. 
При тестах проверяется две вещи: кол-во карт у защищающегося при атаке и корректность прохождения перевода. 
В данный момент оба эти теста всегда проходят. Иногда при тестировании возникают предупреждения о неверных ходах ботов,
это нормально и значит, что боты выполнили действия одновременно друг с другом и одно оказалось устаревшим.   
В основном такое тестирование используется для быстрого прогона игровой логики.
Если поставить тест на 10-20 секунд, большая часть веток алгоритма будут пройдены.  

### Отладка сервера  
Для более направленной отладки лучше использовать дебаггер.  
Для этого нужно запустить node со специальным флагом: `node --inspect server`. 
Перед запуском сервера можно указать точки остановки прямо в коде при помощи ключевого слова `debugger`.  
Дальше нужно открыть Chrome, запустить дебаггер (консоль), там должна появиться иконка Node.js, нажать ее. 
После этого откроется еще одно окно и дебаггер подключится к ноду.  
Если это не работает, можно скопировать ссылку из консоли и открыть ее в хроме.  
Также из консоли есть доступ к серверу и всем его элементам: `server`.  
И если запущены тесты, есть доступ к тестовой игре: `game`.  

### Серверные логи  
В папке \logs создаются логи сервера. Каждая игра, игрок и очередь создают свои логи.  
Логи именуются по шаблону `Type-DATEtTIME.log`.  
Нужный лог можно найти по сообщениям в консоли. Например:    
`03:02:36:554 - warn: [Game#IgXcRjU] Invalid action bot_U2rIpo2 PASS { type: 'PASS' }`  
Полный лог будет в файле с именем, начинающимся на `Game#IgXcRjU`, соответствующую строку в файле можно найти по таймкоду `03:02:36:554`.  
Для создания логов и вывода сообщений в консоль используется [winston](https://github.com/winstonjs/winston).

### Полезные для отладки фичи  
* Кнопка D в правом нижнем углу открывает меню переключения режима отладки отдельных элементов игры  
* Кнопка S пропускает все запланированные анимации  
* Глобально доступные модули: `game, gameOptions, gameInfo, actionHandler, ui, skinManager, cardControl, connection, fieldManager, cardEmitter, cardManager`  
* `printLayers()` - выводит в консоль вертикальное положение элементов игры  
* Средний клик на карте, потом в консоли Chrome правый клик на появившейся строчке -> `Store as global var`, чтобы получить прямой доступ к карте
(сейчас работает только с картами в руке игрока)

## Разработка

### Пакетная обработка  
Есть несколько скриптов для облегчения разработки и загрузки игры на сервер при помощи [gulp](http://gulpjs.com/).  
`gulp addtags` добавляет `<script>` теги с адресами .js файлов из public\js в index.html для облегчения локального теста игры.  
`gulp build` создает копию игры в папке prod, минифицируя .js файлы из public\js.
Также туда копируются файлы для загрузки игры на сервер heroku.  
`gulp buildall` в дополнению ко всему вышеперечисленному копирует документацию и отчеты в prod\public.  
`gulp buildsafe` и `gulp buildallsafe` делает тоже самое, только убирает все игровые модули клиента из глобального доступа
(предотвращает модифицирование поведения клиента игры через консоль)  
Для того, чтобы эти скрипты могли найти .js файлы и правильно их собрать, необходимо указать имена файлов в public/js/index.js:  
`\\@include:ИмяФайлаИлиПапки`  
Если указано имя папки, то будет добавлен файл с таким же именем в этой папке (Filename/Filename.js).  
Если файл уже указан в index.js, в нем можно указывать имена других файлов и т.д.  

### Документация  
`npm run doc` генерирует документацию из комментариев в папке doc при помощи [JSDoc](http://usejsdoc.org/).
Тестовая версия загружена на [durak.herokuapp.com/doc/client/](https://durak.herokuapp.com/doc/client/).  
Шаблон документации классов на сервере:  

```javascript  
'use strict';

class Example extends OtherClass{

	/**
 	 * Описание класса.
 	 * @extends {OtherClass}
	 * @param  {type} param
	 */
	constructor(param){
		super();

		/**
		 * Описание свойства
		 * @type {type}
		 */
		this.param = param
	}


	/**
	 * Описание getterSetter.
	 * @type {type}
	 */
	get getterSetter(){

	}
	set getterSetter(value){

	}

	/**
	 * Описание readOnlyParam.
	 * @type {type}
	 * @readonly
	 */
	get readOnlyParam(){

	}
}

/**
 * {@link Example}
 * @module
 */    
module.exports = Example;  
```  

`@module` ставится внизу, чтобы заставить генератор добавить файл в список модулей, но не представлять класс, как свойство модуля (класс это и есть модуль).  
В корне репозитория лежит модифицированный файл подсветки синтаксиса для Sublime 3 с подсветкой документации (с этим она значительно более читабильна в коде).

### Валидация кода  
В репозитории настроены `.jshintrc` файлы для линтинга кода при помощи [JSHint](http://jshint.com/install/).  
`npm run report` создает отчеты по коду в папке report при помощи [plato](https://github.com/es-analysis/plato).
Там можно посмотреть ошибки линтинга и сложность кода.  

## Что нужно сделать

### Clientside  
* Оповещение о последовательности хода  
    * Иконки ролей игроков  
    * Оповещение о специальных действиях игроков  
    * Ограничить размер игровых сообщений, чтобы они не показывались под картами и не переходили на две строки  
* Более удобный выбор карт на мобильных платформах  
* Попробовать пофиксить баги хотя бы на тех мобильных платформах, к которым есть прямой доступ  

### Serverside  
* Таймаут игрока после дисконнекта, после которого он заменяется на бота  
