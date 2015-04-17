var React = require('react');
var isBrowser = (typeof window !== 'undefined');
var Masonry = isBrowser ? window.Masonry || require('masonry') : null;

module.exports = React.createClass({
    displayName: 'MasonryComponent',

    masonry: false,

    options: {transitionDuration: 0},

    reference: "masonryContainer",

    initializeMasonry: function(force) {
        if (!this.masonry || force) {
            if (this.refs[this.reference]) {
                this.masonry = new Masonry(this.refs[this.reference].getDOMNode(), this.options);
            }
        }
    },

    getNewDomChildren: function () {
        if (this.refs[this.reference]) {
            var node = this.refs[this.reference].getDOMNode();
            var children = this.options.itemSelector ? node.querySelectorAll(this.options.itemSelector) : node.children;

            return Array.prototype.slice.call(children);
        } else {
            return [];
        }
    },

    performLayout: function() {
        if (this.masonry) {
            this.masonry.reloadItems();
            this.masonry.layout();
        }
    },

    componentDidMount: function() {
        if (!isBrowser) return;

        this.initializeMasonry();
        this.performLayout();
    },

    componentDidUpdate: function() {
        if (!isBrowser) return;

        this.initializeMasonry();
        this.performLayout();
    },

    componentWillReceiveProps: function() {
        setTimeout(function() {
            this.masonry.reloadItems();
            this.forceUpdate();
        }.bind(this), 0);
    },

    render: function () {
        return (
            React.createElement("div", {ref: "masonryContainer"}, 
                this.props.children
            )
        );
    }
});
