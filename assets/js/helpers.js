function focusOn(target, options = {}) {
    /*
     * ------------------------------------------------------------
     * Options
     * ------------------------------------------------------------
     *
     * duration : Camera animation duration in seconds
     * height   : Camera distance/height above the target
     * pitch    : Camera pitch in degrees
     * heading  : Camera heading in degrees
     *
     * Examples:
     *
     * focusOn("gona-shc");
     *
     * focusOn("gona-shc", {
     *     height: 5000,
     *     pitch: -45,
     *     duration: 2
     * });
     *
     * focusOn({
     *     longitude: 147.65,
     *     latitude: -9.45,
     *     height: 50000
     * });
     */
    const {
        duration = 2,
        height = 10000,
        pitch = -45,
        heading = 0
    } = options;
    let destination;
    // ------------------------------------------------------------
    // 1. Target is an Entity ID
    // ------------------------------------------------------------
    if (typeof target === "string") {
        const entity = viewer.entities.getById(target);
        if (!entity) {
            console.warn(
                `Camera target "${target}" was not found.`
            );
            return;
        }
        /*
         * If the entity has a position, use it.
         */
        if (entity.position) {
            const position =
                entity.position.getValue(
                    Cesium.JulianDate.now()
                );
            if (!position) {
                console.warn(
                    `Entity "${target}" has no valid position.`
                );
                return;
            }
            destination = position;
        }
        /*
         * If it is a polygon/polyline without a simple
         * position, let Cesium calculate its bounding sphere.
         */
        else {
            viewer.flyTo(entity, {
                duration: duration,
                offset: new Cesium.HeadingPitchRange(
                    Cesium.Math.toRadians(heading),
                    Cesium.Math.toRadians(pitch),
                    height
                )
            });
            return;
        }
    }

    // ------------------------------------------------------------
    // 2. Target is already a Cesium Entity
    // ------------------------------------------------------------
    else if (
        target &&
        target.position
    ) {
        const position =
            target.position.getValue(
                Cesium.JulianDate.now()
            );
        if (!position) {
            console.warn(
                "Target entity has no valid position."
            );
            return;
        }
        destination = position;
    }
    // ------------------------------------------------------------
    // 3. Target is explicit coordinates
    // ------------------------------------------------------------
    else if (
        target &&
        typeof target.longitude === "number" &&
        typeof target.latitude === "number"
    ) {
        destination =
            Cesium.Cartesian3.fromDegrees(
                target.longitude,
                target.latitude,
                target.height ?? height
            );
    }

    // ------------------------------------------------------------
    // 4. Invalid target
    // ------------------------------------------------------------
    else {
        console.warn(
            "Invalid camera target:",
            target
        );
        return;
    }

    // ------------------------------------------------------------
    // Fly camera to the calculated position
    // ------------------------------------------------------------
    viewer.camera.flyTo({
        destination: destination,
        orientation: {
            heading:
                Cesium.Math.toRadians(heading),
            pitch:
                Cesium.Math.toRadians(pitch),
            roll: 0
        },
        duration: duration
    });
}

async function loadGeoJSON(file,options = {}) {
    const dataSource =
        await Cesium.GeoJsonDataSource.load(
            file,
            {
                stroke: options.stroke ??
                    Cesium.Color.WHITE,
                strokeWidth: options.strokeWidth ?? 2,
                fill: options.fill ??
                    Cesium.Color.WHITE.withAlpha(0.05)
            }
        );
    viewer.dataSources.add(dataSource);
    return dataSource;
}

async function loadExtrudedGeoJSON(file, options = {}) {
    var {
        height = 500,
        stroke = Cesium.Color.WHITE,
        strokeWidth = 2,
        fill = Cesium.Color.WHITE.withAlpha(0.08),
        showLabels = false,
        labelField = null
    } = options;
    /*
     * Load GeoJSON WITHOUT clamping.
     *
     * We're going to turn the polygons into
     * explicit 3D extrusions ourselves.
     */
    const dataSource =
        await Cesium.GeoJsonDataSource.load(file, {
            stroke: stroke,
            strokeWidth: strokeWidth,
            fill: fill,
            clampToGround: false
        });
    viewer.dataSources.add(dataSource);
    /*
     * Configure every polygon as an extruded volume.
     */
    
    dataSource.entities.values.forEach(entity => {
        if (!entity.polygon) {
            return;
        }
        console.log(entity.properties.Province._value);
        if(entity.properties.Province._value=="ORO") {
            stroke = Cesium.Color.RED.withAlpha(0.9);
            fill = Cesium.Color.RED.withAlpha(0.08);
        } else if(entity.properties.Province._value=="CENTRAL") {
            stroke = Cesium.Color.WHITE.withAlpha(0.9);
            fill = Cesium.Color.CYAN.withAlpha(0.08);
        } else if(entity.properties.Province._value=="NATIONAL CAPITAL DISTRICT") {
            stroke = Cesium.Color.WHITE.withAlpha(0.9);
            fill = Cesium.Color.DARKORANGE.withAlpha(0.08);
        }
        /*
         * Bottom of the extrusion.
         *
         * Height 0 = sea level.
         */
        entity.polygon.height = new Cesium.ConstantProperty(0);
        /*
         * Top of the extrusion.
         */
        entity.polygon.extrudedHeight = new Cesium.ConstantProperty(height);
        /*
         * Make the polygon translucent.
         */
        entity.polygon.material =
            new Cesium.ColorMaterialProperty(
                fill
            );
        /*
         * Make the sides visible.
         */
        entity.polygon.outline = new Cesium.ConstantProperty(true);
        entity.polygon.outlineColor = new Cesium.ConstantProperty(stroke);
        entity.polygon.outlineWidth = new Cesium.ConstantProperty(strokeWidth);
        /*
         * Make the extrusion behave as a
         * proper 3D object.
         */
        entity.polygon.perPositionHeight = new Cesium.ConstantProperty(false);
        /*
         * Optional label.
         */
        if (showLabels && labelField && entity.properties) {
            const property = entity.properties[labelField];
            if (property) {
                const text = property.getValue(Cesium.JulianDate.now());
                entity.label =
                    new Cesium.LabelGraphics({
                        text: String(text),
                        font: "14px Arial",
                        fillColor: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 3,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        showBackground: true,
                        backgroundColor: Cesium.Color.BLACK.withAlpha(0.55),
                        heightReference: Cesium.HeightReference.NONE
                    }
                );
            }
        }
    });
    return dataSource;
}

async function loadTerrainWalls(file, options = {}) {
    const {
        // --------------------------------------------------------
        // Appearance
        // --------------------------------------------------------
        wallHeight = 300,
        wallColor = Cesium.Color.CYAN.withAlpha(0.12),
        outlineColor = Cesium.Color.WHITE.withAlpha(0.95),
        outlineWidth = 3,
        // Optional translucent ground fill
        showGroundFill = true,
        groundFill = Cesium.Color.CYAN.withAlpha(0.025),
        // --------------------------------------------------------
        // Labels
        // --------------------------------------------------------
        labelField = null,
        labelFont = "14px Arial",
        labelColor = Cesium.Color.WHITE,
        // --------------------------------------------------------
        // Whether the original polygon entity remains
        // --------------------------------------------------------
        keepOriginal = false
    } = options;
    // ============================================================
    // LOAD GEOJSON
    // ============================================================
    const dataSource =
        await Cesium.GeoJsonDataSource.load(file, {
            stroke: outlineColor,
            strokeWidth: outlineWidth,
            fill: groundFill,
            clampToGround: true
        });
    viewer.dataSources.add(dataSource);
    // ============================================================
    // MAKE SURE TERRAIN IS AVAILABLE
    // ============================================================
    const terrainProvider =
        viewer.terrainProvider;
    // ============================================================
    // PROCESS EACH POLYGON
    // ============================================================
    for (const entity of dataSource.entities.values) {
        if (!entity.polygon) {
            continue;
        }
        
        // --------------------------------------------------------
        // Get polygon hierarchy
        // --------------------------------------------------------
        const hierarchy =
            entity.polygon.hierarchy.getValue(
                Cesium.JulianDate.now()
            );
        if (!hierarchy) {
            continue;
        }
        /*
         * We use the outer boundary of the polygon.
         *
         * Holes are ignored for the wall because administrative
         * boundaries normally don't need walls around holes.
         */
        const positions =
            hierarchy.positions;
        if (!positions || positions.length < 3) {
            continue;
        }
        // --------------------------------------------------------
        // Convert positions to Cartographic coordinates
        // --------------------------------------------------------
        const cartographics =
            positions.map(position =>
                Cesium.Cartographic.fromCartesian(
                    position
                )
            );
        // --------------------------------------------------------
        // Sample actual terrain height
        // --------------------------------------------------------
        let sampled;
        try {
            sampled =
                await Cesium.sampleTerrainMostDetailed(
                    terrainProvider,
                    cartographics
                );
        } catch (error) {
            console.warn(
                "Could not sample terrain for:",
                entity.name,
                error
            );
            continue;
        }
        // --------------------------------------------------------
        // Create bottom and top heights
        // --------------------------------------------------------
        const bottomHeights =
            sampled.map(carto =>
                carto.height || 0
            );
        const topHeights =
            bottomHeights.map(height =>
                height + wallHeight
            );
        // --------------------------------------------------------
        // Create Cartesian positions
        // --------------------------------------------------------
        const wallPositions =
            sampled.map(carto =>
                Cesium.Cartesian3.fromRadians(
                    carto.longitude,
                    carto.latitude,
                    0
                )
            );
        // ========================================================
        // CREATE 3D WALL
        // ========================================================
        const wallEntity =
            viewer.entities.add({
                name:
                    `${entity.name || "Boundary"} - 3D`,
                wall: {
                    positions:
                        wallPositions,
                    minimumHeights:
                        bottomHeights,
                    maximumHeights:
                        topHeights,
                    material:
                        wallColor,
                    outline: true,
                    outlineColor:
                        outlineColor,
                    outlineWidth:
                        outlineWidth
                },
                properties:
                    entity.properties
            });
        // ========================================================
        // CREATE TOP BOUNDARY LINE
        // ========================================================
        const topPositions =
            sampled.map(carto =>
                Cesium.Cartesian3.fromRadians(
                    carto.longitude,
                    carto.latitude,
                    (carto.height || 0) + wallHeight
                )
            );
        /*
         * Close the polygon.
         */
        topPositions.push(
            topPositions[0]
        );
        viewer.entities.add({
            name:
                `${entity.name || "Boundary"} - Outline`,
            polyline: {
                positions:
                    topPositions,
                width:
                    outlineWidth,
                material:
                    outlineColor,
                clampToGround:
                    false,
                /*
                 * Keep the top edge visible even when viewed
                 * against complicated terrain.
                 */
                disableDepthTestDistance:
                    Number.POSITIVE_INFINITY
            },
            properties:
                entity.properties
        });
        // ========================================================
        // LABEL
        // ========================================================
        if (
            labelField &&
            entity.properties
        ) {
            const property =
                entity.properties[labelField];
            if (property) {
                let text;
                try {
                    text =
                        property.getValue(
                            Cesium.JulianDate.now()
                        );
                } catch {
                    text = property;
                }
                /*
                 * Calculate the approximate centre of the
                 * electorate from its boundary.
                 */
                const center =
                    Cesium.BoundingSphere.fromPoints(
                        topPositions
                    ).center;
                viewer.entities.add({
                    name:
                        `${entity.name || "Boundary"} - Label`,
                    position:
                        center,
                    label: {
                        text:
                            String(text),
                        font:
                            labelFont,
                        fillColor:
                            labelColor,
                        outlineColor:
                            Cesium.Color.BLACK,
                        outlineWidth:
                            3,
                        style:
                            Cesium.LabelStyle
                                .FILL_AND_OUTLINE,
                        showBackground:
                            true,
                        backgroundColor:
                            Cesium.Color.BLACK
                                .withAlpha(0.55),
                        backgroundPadding:
                            new Cesium.Cartesian2(
                                8,
                                5
                            ),
                        disableDepthTestDistance:
                            Number.POSITIVE_INFINITY
                    }
                });
            }
        }
        // ========================================================
        // HIDE ORIGINAL POLYGON IF REQUESTED
        // ========================================================
        if (!keepOriginal) {
            entity.show =
                showGroundFill;
            if (entity.polygon) {
                entity.polygon.material =
                    new Cesium.ColorMaterialProperty(
                        groundFill
                    );
            }
        }
    }
    // ============================================================
    // RETURN ORIGINAL DATASOURCE
    // ============================================================
    return dataSource;
}

function addDistrictLabel(
    text,
    longitude,
    latitude,
    options = {}
) {
    const {
        font = "bold 48px Arial",
        fillColor =
            Cesium.Color.WHITE,
        outlineColor =
            Cesium.Color.BLACK,
        outlineWidth = 5
    } = options;

    return viewer.entities.add({
        position:
            Cesium.Cartesian3.fromDegrees(
                longitude,
                latitude
            ),
        label: {
            text: text,
            font: font,
            fillColor: fillColor,
            outlineColor: outlineColor,
            outlineWidth: outlineWidth,
            style:
                Cesium.LabelStyle.FILL_AND_OUTLINE,
            heightReference:
                Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance:
                Number.POSITIVE_INFINITY,
            showBackground: false
        }
    });
}
function styleHealthFacilities(dataSource) {
    dataSource.entities.values.forEach(entity => {
        //console.log(entity._properties._HCDESC._value);
        if (!entity._properties) {
            return;
        }
        entity.name = entity._properties._HCDESC._value;
        entity.label = {
            text: entity.name,
            font: "13px Arial",
            pixelOffset: new Cesium.Cartesian2(0, -20),
            showBackground: true,
            backgroundPadding: new Cesium.Cartesian2(6, 4),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0,500000)
        }
        const props = entity._properties;
        const spt = props._HCDESC._value.split(' ');
        const type = spt[spt.length-1].trim();
        // Remove automatically generated graphics
        entity.point = undefined;
        entity.billboard = undefined;
        // --------------------------------------------------------
        // Hospital
        // --------------------------------------------------------
        if (type === "HC") {
            console.log("FOUNDHC")
            entity.point =  {
                pixelSize: 16,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                outlineWidth: 2
            }
            /*entity.billboard = new Cesium.BillboardGraphics({
                image: "icons/hospital.png",
                width: 32,
                height: 32,
                verticalOrigin:
                    Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance:
                    Number.POSITIVE_INFINITY
            });*/
        }
        // --------------------------------------------------------
        // Health Centre
        // --------------------------------------------------------
        else if (type === "SC") {
            entity.point =  {
                pixelSize: 12,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                outlineWidth: 2
            }
        }
        // --------------------------------------------------------
        // Aid Post
        // --------------------------------------------------------
        else {
            entity.point =  {
                pixelSize: 9,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                outlineWidth: 2
            }
        }
    });
}
function copyCameraPosition() {
    const camera = viewer.camera;
    // Camera position in Cartesian coordinates → geographic
    const cartographic =
        Cesium.Cartographic.fromCartesian(camera.position);
    const longitude =
        Cesium.Math.toDegrees(cartographic.longitude);
    const latitude =
        Cesium.Math.toDegrees(cartographic.latitude);
    const height =
        cartographic.height;
    // Camera orientation
    const heading =
        Cesium.Math.toDegrees(camera.heading);
    const pitch =
        Cesium.Math.toDegrees(camera.pitch);
    const roll =
        Cesium.Math.toDegrees(camera.roll);
    const output = `{
    destination: Cesium.Cartesian3.fromDegrees(
        ${longitude.toFixed(6)},
        ${latitude.toFixed(6)},
        ${height.toFixed(2)}
    ),
    orientation: {
        heading: Cesium.Math.toRadians(${heading.toFixed(2)}),
        pitch: Cesium.Math.toRadians(${pitch.toFixed(2)}),
        roll: Cesium.Math.toRadians(${roll.toFixed(2)})
    }
}`;
    console.log(output);
    navigator.clipboard.writeText(output);
    return output;
}
