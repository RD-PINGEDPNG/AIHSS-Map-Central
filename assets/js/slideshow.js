const rpSlideshow = {
    districtLabels: {},
    boundaries: {},
    facilities: {},
    playPos: 0
};
const allowList = ['Upulima SC', 'Moreguina HC', 'Paramana SC', 'Hula SC', 'Kwikila HC', 
    'RMC UC', 'Kuriva SC', 'Inawaia SC', 'Agevairu SC', 'Akufa SC', 'Kanosia SC', 'Kubuna SC', 
    'Doa SC', 'Woitape HC',
    'Ako SC', 'Ambasi SC', 'Gona SC', 'Oro Bay HC', 'Popondetta UC', 'Tufi HC', 'Wanigela SC',
    'Ioma SC', 'Manau SC'

];

rpSlideshow.nextFrame = function() {
    rpSlideshow.playPos += 1;
    rpSlideshow.applyFrame();
}

rpSlideshow.prevFrame = function() {
    rpSlideshow.playPos -= 1;
    rpSlideshow.applyFrame();
}

rpSlideshow.applyFrame = function() {
    const cpos = rpSlideshow.playPos;
    if(cpos == 0) {
        //Fly to Iaraguma Haus
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                147.186534,
                -9.451337,
                458.36
            ),
            orientation: {
                heading: Cesium.Math.toRadians(0.00),
                pitch: Cesium.Math.toRadians(-45.00),
                roll: Cesium.Math.toRadians(360.00)
            }
        });
        
        //Hide all HFs
        rpSlideshow.facilities.show = false;
        //Hide all district labels
        for(const d in rpSlideshow.districtLabels) {
            rpSlideshow.districtLabels[d].show = false;
        }
        //Hide all boundaries
        rpSlideshow.boundaries.show = false;
        // Lock camera to a point
        
        startOrbit(147.18683479858285,-9.448419072352344,{range: 500, pitch: -45, speed: 2, height: 100});

        // Orbit this point
        /*viewer.clock.onTick.addEventListener(function (clock) {
            viewer.scene.camera.rotateRight(0.005);
        });*/
    } else if (cpos == 1) {
        stopOrbit();
        viewer.camera.flyTo({
            destination: Cesium.Rectangle.fromDegrees(
                140.5,
                -12.0,
                155.3,
                -0.2
            ),
            orientation: {
                heading: 0,
                pitch: Cesium.Math.toRadians(-90),
                roll: 0
            },
            duration: 3
        });
    } else if (cpos == 2) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                147.6585117019093,-11.545556671143707,  505000
            ),
            orientation: {
                heading: 0,
                pitch: Cesium.Math.toRadians(-65),
                roll: 0
            },
            complete: function () {
                rpSlideshow.boundaries.show = true;
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.Province._value=="ORO") {
                        entity.show = true;
                    } else if(entity.properties.Province._value=="CENTRAL") {
                        entity.show = true;
                    } else {
                        entity.show = false;
                    }
                });
            }
        });
    } else if (cpos == 3) {
        for(const d in rpSlideshow.districtLabels) {
            const ff = function() {
                rpSlideshow.districtLabels[d].show = true;
            };
            setTimeout(ff, 40);
        }
    } else if (cpos == 4) {
        rpSlideshow.facilities.show = true;
    } else if (cpos == 5) {
        rpSlideshow.facilities.entities.values.forEach(entity => {
            if(allowList.indexOf(entity.name) < 0) {
                entity.show = false;
            }
        })
    } else if (cpos == 6) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                148.859109,
                -11.387071,
                99044.82
            ),
            orientation: {
                heading: Cesium.Math.toRadians(356.95),
                pitch: Cesium.Math.toRadians(-36.03),
                roll: Cesium.Math.toRadians(1.78)
            },
            complete: function() {
                //Hide borders and stuff
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.District._value == 'ABAU') {
                        entity.show = false;
                    }
                });
            }
        });
    } else if (cpos == 7) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                146.874203,
                -10.775777,
                81056.32
            ),
            orientation: {
                heading: Cesium.Math.toRadians(42.31),
                pitch: Cesium.Math.toRadians(-30.10),
                roll: Cesium.Math.toRadians(359.99)
            },
            complete: function() {
                //Hide borders and stuff
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.District._value == 'ABAU') {
                        entity.show = true;
                    } else if(entity.properties.District._value == 'RIGO') {
                        entity.show = false;
                    }
                });
            }
        });
    } else if (cpos == 8) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                146.482370,
                -10.121693,
                80774.77
            ),
            orientation: {
                heading: Cesium.Math.toRadians(42.31),
                pitch: Cesium.Math.toRadians(-30.10),
                roll: Cesium.Math.toRadians(359.99)
            },
            complete: function() {
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.District._value == 'RIGO') {
                        entity.show = true;
                    } else if(entity.properties.District._value == 'HIRI - KOIARI') {
                        entity.show = false;
                    }
                });
            }
        });
    } else if (cpos == 9) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                146.769915,
                -9.691114,
                57815.12
            ),
            orientation: {
                heading: Cesium.Math.toRadians(349.69),
                pitch: Cesium.Math.toRadians(-30.82),
                roll: Cesium.Math.toRadians(0.00)
            },
            complete: function() {
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.District._value == 'HIRI - KOIARI') {
                        entity.show = true;
                    } else if(entity.properties.District._value == 'KAIRUKU') {
                        entity.show = false;
                    }
                });
            }
        });
    } else if (cpos == 10) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                146.362272,
                -6.997622,
                102240.81
            ),
            orientation: {
                heading: Cesium.Math.toRadians(153.06),
                pitch: Cesium.Math.toRadians(-30.67),
                roll: Cesium.Math.toRadians(359.98)
            },
            complete: function() {
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.District._value == 'KAIRUKU') {
                        entity.show = true;
                    } else if(entity.properties.District._value == 'GOILALA') {
                        entity.show = false;
                    }
                });
            }
        });
    } else if (cpos == 11) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                148.059498,
                -7.147170,
                114706.56
            ),
            orientation: {
                heading: Cesium.Math.toRadians(196.72),
                pitch: Cesium.Math.toRadians(-40.65),
                roll: Cesium.Math.toRadians(359.97)
            },
            complete: function() {
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.District._value == 'GOILALA') {
                        entity.show = true;
                    } else if(entity.properties.District._value == 'SOHE') {
                        entity.show = false;
                    }
                });
            }
        });
    } else if (cpos == 12) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                149.117422,
                -8.168853,
                58719.82
            ),
            orientation: {
                heading: Cesium.Math.toRadians(233.81),
                pitch: Cesium.Math.toRadians(-30.63),
                roll: Cesium.Math.toRadians(0.15)
            },
            complete: function() {
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.District._value == 'SOHE') {
                        entity.show = true;
                    } else if(entity.properties.District._value == 'POPONDETTA') {
                        rpSlideshow.districtLabels['popondetta'].show = false;
                        entity.show = false;
                    }
                });
            }
        })
    } else if (cpos == 13) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                149.968997,
                -8.670486,
                73686.38
            ),
            orientation: {
                heading: Cesium.Math.toRadians(233.80),
                pitch: Cesium.Math.toRadians(-30.62),
                roll: Cesium.Math.toRadians(0.15)
            },
            complete: function() {
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.District._value == 'POPONDETTA') {
                        entity.show = true;
                        rpSlideshow.districtLabels['popondetta'].show = true;
                    } else if(entity.properties.District._value == 'IJIVITARI') {
                        rpSlideshow.districtLabels['popondetta'].show = false;
                        entity.show = false;
                    }
                });
            }
        });
    } else if (cpos == 14) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                147.6585117019093,-11.545556671143707,  505000
            ),
            orientation: {
                heading: 0,
                pitch: Cesium.Math.toRadians(-65),
                roll: 0
            },
            duration: 3,
            complete: function() {
                rpSlideshow.boundaries.entities.values.forEach(entity => {
                    if(entity.properties.District._value == 'IJIVITARI') {
                        entity.show = true;
                        rpSlideshow.districtLabels['popondetta'].show = true;
                    }
                });
            }
        });
    }
}

