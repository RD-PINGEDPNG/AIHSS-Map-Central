// ============================================================
// CAMERA ORBIT CONTROLLER
// ============================================================

let orbitAnimationFrame = null;
let orbitActive = false;


/**
 * Start orbiting around a geographic coordinate.
 *
 * @param {number} longitude - Longitude in degrees
 * @param {number} latitude  - Latitude in degrees
 * @param {object} options
 *
 * Options:
 *
 * range        Distance from target in metres
 * pitch        Camera pitch in degrees
 * speed        Orbit speed in degrees/second
 * heading      Starting heading in degrees
 * height       Target height above ellipsoid in metres
 */
function startOrbit(longitude, latitude, options = {}) {
    // --------------------------------------------------------
    // Stop any existing orbit
    // --------------------------------------------------------
    stopOrbit();
    const {
        range = 5000,
        pitch = -35,
        speed = 10,
        heading = 0,
        height = 0
    } = options;
    // --------------------------------------------------------
    // Target coordinate
    // --------------------------------------------------------
    const target =
        Cesium.Cartesian3.fromDegrees(
            longitude,
            latitude,
            height
        );
    // --------------------------------------------------------
    // Convert pitch to radians
    // --------------------------------------------------------
    const pitchRadians =
        Cesium.Math.toRadians(pitch);
    // --------------------------------------------------------
    // Current heading
    // --------------------------------------------------------
    let currentHeading =
        Cesium.Math.toRadians(heading);
    // --------------------------------------------------------
    // Orbit speed
    // --------------------------------------------------------
    const speedRadians =
        Cesium.Math.toRadians(speed);
    // --------------------------------------------------------
    // Animation timing
    // --------------------------------------------------------
    let previousTime =
        performance.now();
    orbitActive = true;
    // --------------------------------------------------------
    // Orbit animation
    // --------------------------------------------------------
    function animate(currentTime) {
        if (!orbitActive) {
            return;
        }
        // Time since previous frame
        const deltaTime =
            (currentTime - previousTime) / 1000;
        previousTime =
            currentTime;
        // Advance heading
        currentHeading +=
            speedRadians * deltaTime;
        // Keep heading within 0–360°
        currentHeading =
            currentHeading %
            Cesium.Math.TWO_PI;
        // ----------------------------------------------------
        // Position camera around target
        // ----------------------------------------------------
        viewer.camera.lookAt(
            target,
            new Cesium.HeadingPitchRange(
                currentHeading,
                pitchRadians,
                range
            )
        );
        // Continue animation
        orbitAnimationFrame =
            requestAnimationFrame(animate);
    }
    // Start
    orbitAnimationFrame =
        requestAnimationFrame(animate);
}

/**
 * Stop the current camera orbit.
 */
function stopOrbit() {
    orbitActive = false;
    if (orbitAnimationFrame !== null) {
        cancelAnimationFrame(
            orbitAnimationFrame
        );
        orbitAnimationFrame = null;
    }
    /*
     * Release the camera from the lookAt
     * reference frame.
     *
     * Without this, subsequent camera movements
     * can behave strangely because Cesium is still
     * using the lookAt transform.
     */
    viewer.camera.lookAtTransform(
        Cesium.Matrix4.IDENTITY
    );
}


/**
 * Check whether an orbit is currently running.
 */
function isOrbiting() {
    return orbitActive;
}