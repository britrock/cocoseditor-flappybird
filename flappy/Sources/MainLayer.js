/**
 * @GameName :
 * flappy bird
 *
 * @DevelopTool:
 * Cocos2d-x Editor (CocosEditor)
 *
 * @time
 * 2014-02-11 am
 *
 * @Licensed:
 * This showcase is licensed under GPL.
 *
 * @Authors:
 * Programmer: touchSnow
 *
 * @Links:
 * http://www.cocos2d-x.com/ (cocos官方)
 * https://github.com/makeapp      （github）
 * http://blog.csdn.net/touchsnow (csdn博客)
 * http://blog.makeapp.co/ （官方博客）
 * http://www.cocoseditor.com/ （建设中官网）
 *
 * @Contact
 * 邮箱：zuowen@makeapp.co
 * qq群：232361142
 *
 */


FP_MAIN_TEXTURE = {
    HOSE: ["holdback1.png", "holdback2.png"]
};

READY = 1;
START = 2;
OVER = 3;

var MainLayer = function ()
{
    cc.log("MainLayer");
    this.bird = this.bird || {};
    this.ground = this.ground || {};
    this.hoseNode = this.hoseNode || {};
    this.readyNode = this.readyNode || {};
    this.overNode = this.overNode || {};

    this.passTime = 0;
    this.hoseSpriteList = [];
    this.isStart = false;

    this.gameMode = READY;
};

MainLayer.prototype.onDidLoadFromCCB = function ()
{
    if (sys.platform == 'browser') {
        this.onEnter();
    }
    else {
        this.rootNode.onEnter = function ()
        {
            this.controller.onEnter();
        };
    }

    this.rootNode.schedule(function (dt)
    {
        this.controller.onUpdate(dt);
    });

    this.rootNode.onExit = function ()
    {
        this.controller.onExit();
    };

    this.rootNode.onTouchesBegan = function (touches, event)
    {
        this.controller.onTouchesBegan(touches, event);
        return true;
    };

    this.rootNode.onTouchesMoved = function (touches, event)
    {
        this.controller.onTouchesMoved(touches, event);
        return true;
    };
    this.rootNode.onTouchesEnded = function (touches, event)
    {
        this.controller.onTouchesEnded(touches, event);
        return true;
    };
    this.rootNode.setTouchEnabled(true);
};

MainLayer.prototype.onEnter = function ()
{
    cc.AnimationCache.getInstance().addAnimations("Resources/flappy_frame.plist");
    this.groundRun();
    this.ground.setZOrder(10);
    this.birdReadyAction();
    this.bird.setZOrder(20);
    this.readyNode.setVisible(true);
    this.overNode.setVisible(false);

    for (var i = 0; i < 30; i++) {
        this.newHose(i);
    }

    // this.languageLabel.setZOrder(150);
};

MainLayer.prototype.newHose = function (num)
{
    var hoseHeight = 830;
    var acrossHeight = 300;
    var downHeight = 100 + getRandom(400);
    var upHeight = 1100 - downHeight - acrossHeight;

    var hoseX = 400 * num;

    var HoseName = FP_MAIN_TEXTURE.HOSE;
    var ccSpriteDown = cc.Sprite.createWithSpriteFrameName(HoseName[0]);
    ccSpriteDown.setZOrder(1);
    ccSpriteDown.setAnchorPoint(cc.p(0, 0));
    ccSpriteDown.setPosition(cc.p(hoseX, 0));
    ccSpriteDown.setScaleY(downHeight / hoseHeight);

    var ccSpriteUp = cc.Sprite.createWithSpriteFrameName(HoseName[1]);
    ccSpriteUp.setZOrder(1);
    ccSpriteUp.setAnchorPoint(cc.p(0, 0));
    ccSpriteUp.setPosition(cc.p(hoseX, downHeight + acrossHeight));
    ccSpriteUp.setScaleY(upHeight / hoseHeight);

    this.hoseNode.addChild(ccSpriteDown);
    this.hoseNode.addChild(ccSpriteUp);
    this.hoseSpriteList.push(ccSpriteDown);
    this.hoseSpriteList.push(ccSpriteUp);
    return null;
};

MainLayer.prototype.groundRun = function ()
{
    var action1 = cc.MoveTo.create(0.5, cc.p(-120, 0));
    var action2 = cc.MoveTo.create(0, cc.p(0, 0));
    var action = cc.Sequence.create(action1, action2);
    this.ground.runAction(cc.RepeatForever.create(action));
}

MainLayer.prototype.birdReadyAction = function ()
{
    var birdX = this.bird.getPositionX();
    var birdY = this.bird.getPositionY();
    var time = birdY / 2000;
    var actionFrame = cc.Animate.create(cc.AnimationCache.getInstance().getAnimation("fly"));
    var flyAction = cc.Repeat.create(actionFrame, 90000);
    this.bird.runAction(cc.Sequence.create(
            flyAction)
    );
}

MainLayer.prototype.birdFallAction = function ()
{
    this.gameMode = OVER;
    this.bird.stopAllActions();
    this.ground.stopAllActions();
    var birdX = this.bird.getPositionX();
    var birdY = this.bird.getPositionY();
    var time = birdY / 2000;
    this.bird.runAction(cc.Sequence.create(
            cc.DelayTime.create(0.1),
            cc.Spawn.create(cc.RotateTo.create(time, 90), cc.MoveTo.create(time, cc.p(birdX, 50))))
    );
    this.overNode.setVisible(true);
}

MainLayer.prototype.birdRiseAction = function ()
{
    var riseHeight = 60;
    var birdX = this.bird.getPositionX();
    var birdY = this.bird.getPositionY();
    var time = birdY / 600;

    var actionFrame = cc.Animate.create(cc.AnimationCache.getInstance().getAnimation("fly"));
    var flyAction = cc.Repeat.create(actionFrame, 90000);
    var riseAction1 = cc.MoveTo.create(0.2, cc.p(birdX, birdY + riseHeight));
    var riseAction2 = cc.RotateTo.create(0, -30);
    var riseAction = cc.Spawn.create(riseAction1, riseAction2);
    var fallAction1 = cc.MoveTo.create(time, cc.p(birdX, 50));
    var fallAction2 = cc.Sequence.create(cc.DelayTime.create(time / 6), cc.RotateTo.create(0, 30));
    var fallAction = cc.Spawn.create(fallAction1, fallAction2);

    this.bird.stopAllActions();
    this.bird.runAction(cc.Spawn.create(
            cc.Sequence.create(riseAction, cc.DelayTime.create(0.1), fallAction),
            flyAction)
    );
}

MainLayer.prototype.onUpdate = function (dt)
{
    if (this.gameMode != START) {
        return;
    }
    this.passTime += dt;

    this.hoseNode.setPositionX(800 - 200 * this.passTime);
    this.bird.setPositionX(-500 + 200 * this.passTime);
    this.checkCollision();
}

MainLayer.prototype.checkCollision = function ()
{
    if (this.bird.getPositionY() < 60) {
        cc.log("floor");
        this.birdFallAction();
        return;
    }


    for (var i = 0; i < this.hoseSpriteList.length; i++) {
        var hose = this.hoseSpriteList[i];
        if (!this.isInScreen(hose)) {
            // continue;
        }

        var birdRect = this.bird.getBoundingBox();
       // var birdRect = cc.rectCreate(cc.p(rect.x + rect.width / 2 + rect.y + rect.height / 2), 25);
       // cc.log("bird position==" + this.bird.getPosition());
        if (cc.rectIntersectsRect(hose.getBoundingBox(), birdRect)) {
            cc.log("hose positionX==" + hose.getBoundingBox().x);
            cc.log("this.bird positionX==" + this.bird.getBoundingBox().x);
            cc.log("i==" + i);
            cc.log("birdFallAction");
            this.birdFallAction();
            return;
        }
    }
}

MainLayer.prototype.isInScreen = function (sprite)
{
    return (sprite.getPositionX() > 0 && sprite.getPositionX() < 720);
}

MainLayer.prototype.onStartClicked = function ()
{
    cc.Director.getInstance().resume();
    cc.BuilderReader.runScene("", "MainLayer");
}

MainLayer.prototype.onExit = function ()
{
    cc.log("onExit");
}

MainLayer.prototype.onTouchesBegan = function (touches, event)
{
    var loc = touches[0].getLocation();
}

MainLayer.prototype.onTouchesMoved = function (touches, event)
{
}

MainLayer.prototype.onTouchesEnded = function (touches, event)
{
    if (this.gameMode == OVER) {
        return;
    }

    if (this.gameMode == READY) {
        this.gameMode = START;
        this.readyNode.setVisible(false);
    }

    var loc = touches[0].getLocation();
    this.birdRiseAction();

}

cc.rectCreate = function (p, area)
{
    return  cc.rect(p.x - area[0], p.y - area[1], area[0] * 2, area[1] * 2);
}

