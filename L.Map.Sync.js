/*
 * Extends L.Map to synchronize two maps
 */

L.Map = L.Map.extend({
    sync: function (map) {
        this._syncMaps = this._syncMaps || [];

        this._syncMaps.push(L.extend(map, {
            setView: function (center, zoom, options, sync) {
                if (!sync) {
                    this._syncMaps.forEach(function (toSync) {
                        toSync.setView(center, zoom, options, true);
                    });
                }
                return L.Map.prototype.setView.call(this, center, zoom, options);
            },

            panBy: function (offset, options, sync) {
                if (!sync) {
                    this._syncMaps.forEach(function (toSync) {
                        toSync.panBy(offset, options, true);
                    });
                }
                return L.Map.prototype.panBy.call(this, offset, options);
            },

            _onResize: function (evt, sync) {
                if (!sync) {
                    this._syncMaps.forEach(function (toSync) {
                        toSync._onResize(evt, true);
                    });
                }
                return L.Map.prototype._onResize.call(this, evt);
            }
        });


        var self = this;
        this.on('zoomend', function() {
            this._syncMaps.forEach(function (toSync) {
                toSync.setView(self.getCenter(), self.getZoom(), {reset: false}, true);
            });
        }, this);


        this.dragging._draggable._updatePosition = function () {
            L.Draggable.prototype._updatePosition.call(this);
            var that = this;
            self._syncMaps.forEach(function (toSync) {
                L.DomUtil.setPosition(toSync.dragging._draggable._element, that._newPos);
                toSync.fire('move');
            });
        };

        return this;
    }
});

