import React from 'react';
import { Circle, Marker, Polygon } from 'react-native-maps';
import { Colors } from '@/shared/constants';
import type { MapArea, MapPoint, MapZone } from '@/shared/components/MapPreview';

// ============================================
// MAP SHAPES
// Everything drawn on a map, in one place so the preview and the full-screen map
// always look the same. Render it INSIDE a MapView.
// Drawing order = stacking order: shapes first, then circles, then pins on top.
// ============================================

// Brand blue at ~15% alpha (hex alpha suffix): circles and shapes share one look,
// they all mean "this professional works here"
export const ZONE_FILL = `${Colors.primary.main}26`;

interface MapShapesProps {
    markers?: MapPoint[];            // Pins of fixed places
    zones?: MapZone[];               // Circles (km around a point)
    areas?: MapArea[];               // Coloured shapes (departments, regions)
    target?: MapPoint;               // The item being looked at (e.g. the annonce), a pin of its own colour
    markerTitle?: string;            // Shown when a pin is tapped (interactive map only)
    targetTitle?: string;
}

export const MapShapes: React.FC<MapShapesProps> = ({
    markers = [],
    zones = [],
    areas = [],
    target,
    markerTitle,
    targetTitle,
}) => (
    <>
        {areas.map((area, index) => (
            <Polygon
                key={`area-${index}`}
                coordinates={area.coordinates}
                holes={area.holes}
                fillColor={ZONE_FILL}
                strokeColor={Colors.primary.main}
                strokeWidth={1.5}
            />
        ))}
        {zones.map((zone, index) => (
            <Circle
                key={`zone-${index}`}
                center={{ latitude: zone.latitude, longitude: zone.longitude }}
                radius={zone.radiusKm * 1000}        // react-native-maps wants meters
                fillColor={ZONE_FILL}
                strokeColor={Colors.primary.main}
                strokeWidth={1.5}
            />
        ))}
        {markers.map((marker, index) => (
            <Marker key={`marker-${index}`} coordinate={marker} title={markerTitle} pinColor={Colors.primary.main} />
        ))}
        {target ? (
            <Marker key="target" coordinate={target} title={targetTitle} pinColor={Colors.secondary.main} />
        ) : null}
    </>
);
