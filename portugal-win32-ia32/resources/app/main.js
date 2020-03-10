function setOpacity(element, opacity) {
    element.style.display = opacity > 0 ? "block" : "none";
    element.style.opacity = opacity;
}

function easing(time) {
    return time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1;
}

function blendTransition(slideElementFrom, slideElementTo) {
    return time => {
        setOpacity(slideElementFrom, 1 - time);
        setOpacity(slideElementTo, time);
    };
}

function slideTransition(slideElementFrom, slideElementTo) {
    return time => {
        blendTransition(slideElementFrom, slideElementTo)(time);
        if (time == 0 || time == 1) {
            slideElementFrom.style.transform = slideElementTo.style.transform = "";
        } else {
            slideElementFrom.style.transform = `translate3d(0, 0, 0) translate(${-time * 200}vmin, 0)`;
            slideElementTo.style.transform = `translate3d(0, 0, 0) translate(${(1 - time) * 200}vmin, 0)`;
        }
    };
}

function mapTransition(slideElementFrom, slideElementTo, pointIndex, direction) {
    return time => {
        if (time == 0 || time == 1) {
            slideElementFrom.style.transform = slideElementTo.style.transform = "";
            slideElementFrom.style.transformOrigin = slideElementTo.style.transformOrigin = "";
            slideElementFrom.style.background = slideElementTo.style.background = "";
            blendTransition(slideElementFrom, slideElementTo)(time);
        } else {
            if (direction == "to") {
                slideElementTo.style.transformOrigin = `${points[pointIndex][0]}vmin ${points[pointIndex][1]}vmin`;
                slideElementTo.style.transform = `translate3d(0, 0, 0) scale(${time}, ${time})`;
                setOpacity(slideElementFrom, 1 - time);
                setOpacity(slideElementTo, 1);
                slideElementTo.style.background = `rgba(255, 255, 255, ${1 - time})`;
            }
            if (direction == "from") {
                slideElementFrom.style.transformOrigin = `${points[pointIndex][0]}vmin ${points[pointIndex][1]}vmin`;
                slideElementFrom.style.transform = `translate3d(0, 0, 0) scale(${1 - time}, ${1 - time})`;
                setOpacity(slideElementTo, time);
                setOpacity(slideElementFrom, 1);
                slideElementFrom.style.background = `rgba(255, 255, 255, ${time})`;
            }
        }
    };
}

let slideNames = [
    "title",
    "intro-1",
    "intro-2",
    "map-1",
    "ria-formosa-1",
    "ria-formosa-2",
    "ria-formosa-3",
    "ria-formosa-4",
    "map-2",
    "madeira-1",
    "madeira-2",
    "madeira-3",
    "map-3",
    "sete-1",
    "sete-2",
    "sete-3",
    "sete-4",
    "map-4",
    "douro-1",
    "douro-2",
    "douro-3",
    "douro-4",
    "map-5",
    "end",
];

let slideElements = [];
for (let slideName of slideNames) {
    slideElements.push(document.querySelector(`.slide-${slideName}`));
}
function getSlideElement(slideName) {
    return slideElements[slideNames.indexOf(slideName)];
}

let indicatorElement = document.querySelector(".indicator");

let globe = null;
let points = [
    [-7.9167, 36.9823],
    [-16.9839, 32.7359],
    [-25.7863, 37.8475],
    [-7.798889, 41.101667],
]
if (document.createElement("canvas").getContext("webgl", { failIfMajorPerformanceCaveat: true }) !== null
    && (location.protocol !== "file:" || navigator.userAgent.toLowerCase().indexOf("electron") != -1)) {
    document.querySelector("#globe>img").style.display = "none";
    globe = new og.Globe({
        target: "globe",
        name: "Earth",
        layers: [
            new og.layer.XYZ("OpenStreetMap", {
                isBaseLayer: true,
                url: "tiles/{z}/{x}/{y}.png",
                maxZoom: 6,
                visibility: true,
            })
        ],
        autoActivate: true,
        sun: {
            active: false,
        },
        controls: [
            new og.control.MouseNavigation({ autoActivate: true }),
            new og.control.ZoomControl({ autoActivate: true }),
        ],
    });
    globe.planet.viewExtent(og.Extent.createFromArray([-11, 45, -5, 34]));
}

setTimeout(() => {
    if (globe !== null) {
        document.querySelector("#globus_viewport_0").style.display = "none";
    }
    document.body.style.opacity = 1;
    for (let i = 0; i < slideNames.length; i++) {
        setOpacity(slideElements[i], i == 0 ? 1 : 0);
    }

    let projection = d3.geoMercator()
        .scale(200)
        .translate([75, 50])
        .center([-7, 39]);

    let u = d3.select(".map")
        .selectAll("path")
        .data(geoJSON.features);
    u.enter()
        .append("path")
        .merge(u)
        .attr("d", d3.geoPath().projection(projection));

    points = points.map(projection);

    let v = d3.select(".points")
        .selectAll("circle")
        .data(points);
    v.enter()
        .append("circle")
        .merge(u)
        .attr("cx", point => point[0])
        .attr("cy", point => point[1])
        .attr("r", 0.5);

    let templateSlideElement = null;
    for (let slideName of slideNames) {
        if (slideName.startsWith("map-")) {
            if (templateSlideElement === null) {
                templateSlideElement = getSlideElement(slideName);
            } else {
                getSlideElement(slideName).innerHTML = templateSlideElement.innerHTML;
            }
        }
    }
}, 0);

let transitionFunctions = [
    time => {
        slideTransition(getSlideElement("title"), getSlideElement("intro-1"))(time);
        if (globe !== null) {
            document.querySelector("#globus_viewport_0").style.display = time === 1 ? "block" : "none";
        }
    },
    time => {
        slideTransition(getSlideElement("intro-1"), getSlideElement("intro-2"))(time);
        if (globe !== null) {
            document.querySelector("#globus_viewport_0").style.display = time === 0 ? "block" : "none";
        }
    },
    slideTransition(getSlideElement("intro-2"), getSlideElement("map-1")),
    mapTransition(getSlideElement("map-1"), getSlideElement("ria-formosa-1"), 0, "to"),
    slideTransition(getSlideElement("ria-formosa-1"), getSlideElement("ria-formosa-2")),
    slideTransition(getSlideElement("ria-formosa-2"), getSlideElement("ria-formosa-3")),
    slideTransition(getSlideElement("ria-formosa-3"), getSlideElement("ria-formosa-4")),
    mapTransition(getSlideElement("ria-formosa-4"), getSlideElement("map-2"), 0, "from"),
    mapTransition(getSlideElement("map-2"), getSlideElement("madeira-1"), 1, "to"),
    slideTransition(getSlideElement("madeira-1"), getSlideElement("madeira-2")),
    time => {
        slideTransition(getSlideElement("madeira-2"), getSlideElement("madeira-3"))(time);
        let videoElement = getSlideElement("madeira-3").querySelector("video");
        if (time === 1) {
            videoElement.play();
        } else {
            videoElement.pause();
            videoElement.currentTime = 0;
        }
    },
    time => {
        mapTransition(getSlideElement("madeira-3"), getSlideElement("map-3"), 1, "from")(time);
        let videoElement = getSlideElement("madeira-3").querySelector("video");
        if (time === 0) {
            videoElement.play();
        } else {
            videoElement.pause();
            videoElement.currentTime = 0;
        }
    },
    mapTransition(getSlideElement("map-3"), getSlideElement("sete-1"), 2, "to"),
    slideTransition(getSlideElement("sete-1"), getSlideElement("sete-2")),
    slideTransition(getSlideElement("sete-2"), getSlideElement("sete-3")),
    slideTransition(getSlideElement("sete-3"), getSlideElement("sete-4")),
    mapTransition(getSlideElement("sete-4"), getSlideElement("map-4"), 2, "from"),
    mapTransition(getSlideElement("map-4"), getSlideElement("douro-1"), 3, "to"),
    slideTransition(getSlideElement("douro-1"), getSlideElement("douro-2")),
    slideTransition(getSlideElement("douro-2"), getSlideElement("douro-3")),
    slideTransition(getSlideElement("douro-3"), getSlideElement("douro-4")),
    mapTransition(getSlideElement("douro-4"), getSlideElement("map-5"), 3, "from"),
    slideTransition(getSlideElement("map-5"), getSlideElement("end")),
];

let slideTime = 15 * 60, transitionTime = 60;
let currentSlideIndex = 0;
let nextSlideIndex = -1;
let currentTime = 0;
let transitionStartTime, transitionEndTime;
let autoModeEnabled = false;
let currentSlideStartTime = 0;
function startTransition() {
    transitionStartTime = currentTime;
    transitionEndTime = currentTime + transitionTime;
    if (nextSlideIndex < currentSlideIndex) {
        transitionFunctions[Math.min(currentSlideIndex, nextSlideIndex)](1);
    } else {
        transitionFunctions[Math.min(currentSlideIndex, nextSlideIndex)](0);
    }
}
function tick() {
    if (autoModeEnabled && currentTime >= currentSlideStartTime + slideTime && nextSlideIndex == -1 && currentSlideIndex < slideNames.length - 1) {
        nextSlideIndex = currentSlideIndex + 1;
        startTransition();
    }
    if (currentSlideIndex == slideNames.length - 1) {
        autoModeEnabled = false;
    }
    if (autoModeEnabled) {
        indicatorElement.style.right = `${(1 - (currentTime - currentSlideStartTime) / slideTime) * 15}vmin`;
        indicatorElement.style.width = `${(currentTime - currentSlideStartTime) / slideTime * 15}vmin`;
    } else {
        indicatorElement.style.right = 0;
        indicatorElement.style.width = 0;
    }
    if (nextSlideIndex != -1) {
        currentSlideStartTime = currentTime;
        if (nextSlideIndex < currentSlideIndex) {
            transitionFunctions[Math.min(currentSlideIndex, nextSlideIndex)](1 - easing((currentTime - transitionStartTime) / (transitionEndTime - transitionStartTime)));
        } else {
            transitionFunctions[Math.min(currentSlideIndex, nextSlideIndex)](easing((currentTime - transitionStartTime) / (transitionEndTime - transitionStartTime)));
        }
        if (currentTime >= transitionEndTime) {
            if (nextSlideIndex < currentSlideIndex) {
                transitionFunctions[Math.min(currentSlideIndex, nextSlideIndex)](0);
            } else {
                transitionFunctions[Math.min(currentSlideIndex, nextSlideIndex)](1);
            }
            currentSlideIndex = nextSlideIndex;
            nextSlideIndex = -1;
        }
    }
    currentTime++;
    requestAnimationFrame(tick);
}
tick();

document.addEventListener("keydown", event => {
    if (event.code == "ArrowLeft") {
        if (nextSlideIndex == -1 && currentSlideIndex > 0) {
            autoModeEnabled = false;
            nextSlideIndex = currentSlideIndex - 1;
            startTransition();
        }
    }
    if (event.code == "ArrowRight") {
        if (nextSlideIndex == -1 && currentSlideIndex < slideNames.length - 1) {
            autoModeEnabled = false;
            nextSlideIndex = currentSlideIndex + 1;
            startTransition();
        }
    }
    if (event.code == "Space") {
        currentSlideStartTime = currentTime;
        autoModeEnabled = !autoModeEnabled;
    }
});
