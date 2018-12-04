const css = `.titlebar {
	padding: 0 3px;
	background-color: #f6f6f6;
}

.titlebar.webkit-draggable {
	-webkit-app-region: drag;
}

.titlebar-stoplight {
	float: left;
}

.titlebar:after,
.titlebar-stoplight:after {
	content: ' ';
	display: table;
	clear: both;
}

.titlebar-stoplight:hover .titlebar-close {
	background-position: -26px 0;
}

.titlebar-stoplight:hover .titlebar-minimize {
	background-position: 0 0;
}

.titlebar-stoplight:hover .titlebar-fullscreen {
	background-position: -13px 0;
}

.titlebar.alt .titlebar-stoplight:hover .titlebar-close {
	background-position: -104px 0;
}

.titlebar.alt .titlebar-stoplight:hover .titlebar-minimize {
	background-position: -78px 0;
}

.titlebar.alt .titlebar-stoplight:hover .titlebar-fullscreen {
	background-position: -91px 0;
}

.titlebar-close,
.titlebar-minimize,
.titlebar-fullscreen {
	float: left;
	margin: 6px 4px;
	background-repeat: no-repeat;
	background-image: url(%s);
	background-size: auto 12px;
	width: 12px;
	height: 12px;
	border-radius: 6px;
}

.titlebar.webkit-draggable .titlebar-close,
.titlebar.webkit-draggable .titlebar-minimize,
.titlebar.webkit-draggable .titlebar-fullscreen {
	-webkit-app-region: no-drag;
}

.titlebar-close {
	position: relative;
	margin-left: 6px;
	background-position: -65px 0;
}

.titlebar-fullscreen {
	position: relative;
	background-position: -52px 0;
}

.titlebar-minimize {
	position: relative;
	background-position: -39px 0;
}

.titlebar-close:active::after,
.titlebar-minimize:active::after,
.titlebar-fullscreen:active::after {
	display: block;
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	content: "";
	background: rgba(0, 0, 0, .25);
	border-radius: 100%;
}
`;

export default css
