/// <reference path="jquery.d.ts" />

enum CardStatus {
     none,
     question,
     view,
}

class ScreenDraw {

    private _numberClass : String = "number-card";
    private _count : number  = 0;
    public ctrlStartBtn(view: boolean) {
        if (view) {
            $(".start").removeAttr("disabled");
        } else {
            $(".start").attr("disabled", "disabled");
            this._count = 0;
        }
    }

    public ctrlCard(status: CardStatus, digit: number, numStr?: String) {
        if (!numStr) {
            numStr = "";
            for (var i = 0; i < digit; i++) {
                switch (status) {
                case CardStatus.none:
                    numStr += "X";
                    break;
                case CardStatus.question:
                    numStr += "?";
                    break;
                }
            }
        }

        var $number = $('.' + this._numberClass);
        if ($number.length != 0) {
            $number.each(function (index: number, elem: Element) {
                    $(elem).text(numStr.charAt(index));
                });
        } else {
            for (var i=0; i < numStr.length; i++) {
                var text = numStr.charAt(i);
                var klass = this._numberClass;
                var $num = $('<div class="' + klass + '">' + text + "</div>");
                $("#card").append($num);
            }
        }
    }

    public viewResult(inputText: string, hit: number, blow: number) {
        this._count++;
        var resultView = $(".hidden").children(".resultView").clone(true);
        resultView.find(".count").text(this._count);
        resultView.find(".input-text").text(inputText);
        resultView.find(".hit").text(hit);
        resultView.find(".blow").text(blow);

        $("#result").append(resultView);
    }

}


class  HitBlow {
    private _digit: number = 0;
    private _answer: String = "";
    constructor(digit: number = 3) {
        this._digit = digit;
        this._digit = (digit > 10) ? 10 : this._digit;
    }

    get answer() : String {
        return this._answer;
    }

    get digit() : number {
        return this._digit;
    }

    public start() {
        var val: String = "";
        var numAttr: number[] = [];
        for (var i = 0; i < 10; i++) {
            numAttr.push(i)
        }

        for (var i = 0; i< this._digit; i++) {
            var num = Math.floor(Math.random() * numAttr.length);
            var rand = numAttr.splice(num, 1);
            val += rand.toString();
        }
        this._answer = val;
    }

    public digitCheck(inputValue : String) : boolean {
        if (inputValue.length != this._digit) {
            return false; // 桁数が他りない
        }
        return true;
    }

    public inputCheck(inputValue : String) : number[] {
        var ret: number[] = [0,0];

        var hitCheck = new HitCheck();
        ret[0] = hitCheck.check(this._answer, inputValue);

        var blowCheck = new BlowCheck();
        ret[1] = blowCheck.check(this._answer, inputValue);

        return ret;
    }
}

interface ICheck {
    check(...result: String[]): number
}

class HitCheck implements ICheck {
    public check(...result: String[]) : number {
        var ret: number = 0;

        if (result.length < 2) {
            return 0;
        }

        var answer : String = result[0];
        var input : String = result[1];

        for (var i = 0; i < answer.length; i++) {
            if (answer.charAt(i) == input.charAt(i)) {
                ret++;
            }
        }
        return ret;
    }
}


class BlowCheck implements ICheck {
    public check(...result: String[]) : number {
        var ret: number = 0;

        if (result.length < 2) {
            return 0;
        }

        var answer : String = result[0];
        var input : String = result[1];

        for (var i = 0; i < result[0].length; i++) {
            if (input[1].indexOf(answer.charAt(i)) != -1) {
                if (answer.charAt(i) != input.charAt(i)) {
                    ret++;
                }
            }
        }
        return ret;
    }
}


$(function () {
        var digit = 3;

        var screenDraw = new ScreenDraw();
        var hitBlow = new HitBlow(digit);

        $("#textarea").hide();
        $(".retire").hide();

        digit = hitBlow.digit;
        screenDraw.ctrlCard(CardStatus.none, digit);

        $(".start").click(function () {
                screenDraw.ctrlStartBtn(false);
                hitBlow.start();
                screenDraw.ctrlCard(CardStatus.question, digit);
                $("#result").empty();

                $("#textarea").show();
                $(".retire").show();

                $("#inputValue").val("");
                console.log(hitBlow.answer);
            });

        $(".input").click(function () {
                var inputText = $("#inputValue").val();

                if (!hitBlow.digitCheck(inputText)) {
                    alert("入力桁数が違います");
                } else {
                    var ret = hitBlow.inputCheck(inputText);
                    var hit = ret[0];
                    var blow = ret[1];
                    screenDraw.viewResult(inputText, hit, blow);

                    if (hit == digit) {
                        screenDraw.ctrlCard(CardStatus.view, digit, inputText);
                        alert("正解");

                        $("#textarea").hide();
                        $(".retire").hide();

                        screenDraw.ctrlStartBtn(true);
                    }
                }
            });

        $(".retire").click(function () {
                alert("正解はl「" + hitBlow.answer + "」です");
                $("#textarea").hide();
                $(".retire").hide();

                digit = hitBlow.digit;
                screenDraw.ctrlCard(CardStatus.none,digit);
                screenDraw.ctrlStartBtn(true);
            });

    });
