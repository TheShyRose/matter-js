var Example = Example || {};

Example.terrain = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Query = Matter.Query,
        Svg = Matter.Svg,
        Bodies = Matter.Bodies,
        Events = Matter.Events;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            background: '#0f0f13',  // 背景色
            showAngleIndicator: false,
            wireframes: false
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var terrain;

    if (typeof $ !== 'undefined') {
        $.get('./svg/circle.svg').done(function(data) {
            var vertexSets = [];
            $(data).find('path').each(function(i, path) {
                vertexSets.push(Svg.pathToVertices(path, 30));
            });

            // 渲染路径(也就是渲染外层的圈)
            terrain = Bodies.fromVertices(400, 300, vertexSets, {
                isStatic: true,
                render: {
                    fillStyle: '#2e2b44',
                    strokeStyle: '#2e2b44',
                    lineWidth: 1
                }
            }, true);
            World.add(world, terrain);

            // 将字符串文本转换为图片
            function createImage(txt) {
                let drawing = document.createElement("canvas");

                drawing.width = '150';
                drawing.height = '150';

                let ctx = drawing.getContext("2d");

                ctx.fillStyle = "white";    // 填充颜色
                //ctx.fillRect(0, 0, 150, 150);
                ctx.beginPath();
                ctx.arc(75, 75, 20, 0, Math.PI * 2, true);  // 画圆
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#000000";  // 字体颜色
                ctx.font = "20pt sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(txt, 75, 85);
                // ctx.strokeText("Canvas Rocks!", 5, 130);

                return drawing.toDataURL("image/png");
            }

            // 初始化小球的属性
            function bodyOptions(txt) {
                return {
                    friction: 0,            // 摩擦系数
                    frictionAir: 0,         // 空气摩擦系数
                    frictionStatic: 0,      // 静态摩擦系数
                    restitution: 1,         // 碰撞恢复系数
                    density: 0.0005,        // 质量
                    render: {               // 渲染相关
                        sprite: {
                            text: txt,      // 用作文本标识
                            texture: createImage(txt),  // 图片
                            xScale: 1,
                            yScale: 1
                        }
                    }
                }
            }

            // 创建小球
            for (let i = 1; i <= 20; i++) {
                let isOdd = i % 2 === 1;
                let b1;
                if (isOdd) {
                    b1 = Bodies.circle(350 + i * 8, 500 - i * 8, 20, bodyOptions(i));
                } else {
                    b1 = Bodies.circle(500 - i * 8, 300 + i * 8, 20, bodyOptions(i));
                }

                // 设置小球的初始速度 (注意: 初始速度最好不要>0.8, 容易蹦出去，不可控)
                Matter.Body.setAngularVelocity(b1, 0.5);
                World.add(world, b1);
            }
        });
    }

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

if (typeof module !== 'undefined') {
    module.exports = Example;
}
