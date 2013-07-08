<!DOCTYPE html>
<!--[if IE 7]>         <html class="no-js lt-ie10 lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie10 lt-ie9"> <![endif]-->
<!--[if IE 9]>         <html class="no-js lt-ie10"> <![endif]-->
<!--[if gt IE 9]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <title>Page title</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width" />

        <link rel="stylesheet" href="css/main.css" />

        <link rel="apple-touch-icon" sizes="144x144" href="apple-touch-icon-144x144-precomposed.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="apple-touch-icon-114x114-precomposed.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="apple-touch-icon-72x72-precomposed.png" />
        <link rel="apple-touch-icon" href="apple-touch-icon-precomposed.png" />
        <link rel="shortcut icon" href="favicon.ico" />

        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="image-144x144px.png" />

        <meta property="og:image" content="image-50x50px.png" />
        <meta property="og:title" content="Page title" />
        <meta property="og:url" content="Current URL" />
        <meta property="og:site_name" content="Site name" />
        <meta property="og:type" content="website" />

        <meta property="twitter:card" content="app" />
        <meta property="twitter:site" content="@twitteraccount" />

        <script src="js/vendor/modernizr-2.6.2-respond-1.1.0.min.js"></script>
        <!--[if (gte IE 6)&(lte IE 8)]>
            <script src="js/plugins/selectivizr/selectivizr.min.js"></script>
        <![endif]-->
    </head>
    <body>
        <!--[if lt IE 8]>
            <p class="chromeframe">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</p>
        <![endif]-->

        <div class="container">
            <header class="header">
                <a class="logo" href="/"><img src="img/logo.png" alt="" /></a>
                <nav class="nav-primary">
                    <ul class="inline-list">
                        <li class="active"><a href="#">link</a></li>
                        <li><a href="#">link</a></li>
                        <li><a href="#">link</a></li>
                    </ul>
                </nav>
            </header>

            <div class="content">
                <section>
                    <h1>Grid</h1>
                    <div class="grid clearfix">
                        <div class="columns-12 omega" style="background: rgba(0,0,0,0.1)">column 12</div>
                    </div>
                    <div class="grid clearfix">
                        <div class="columns-6" style="background: rgba(0,0,0,0.1)">column 6</div>
                        <div class="columns-6 omega" style="background: rgba(0,0,0,0.1)">column 6</div>
                    </div>
                    <div class="grid clearfix">
                        <div class="columns-4" style="background: rgba(0,0,0,0.1)">column 4</div>
                        <div class="columns-8 omega" style="background: rgba(0,0,0,0.1)">column 8</div>
                    </div>
                    <div class="grid clearfix">
                        <div class="columns-2" style="background: rgba(0,0,0,0.1)">column 2</div>
                        <div class="columns-10 omega" style="background: rgba(0,0,0,0.1)">column 10</div>
                    </div>
                    <div class="grid clearfix">
                        <div class="columns-7" style="background: rgba(0,0,0,0.1)">column 7</div>
                        <div class="columns-5 omega" style="background: rgba(0,0,0,0.1)">column 5</div>
                    </div>
                    <div class="grid clearfix">
                        <div class="columns-9" style="background: rgba(0,0,0,0.1)">column 9</div>
                        <div class="columns-3 omega" style="background: rgba(0,0,0,0.1)">column 3</div>
                    </div>
                </section>

                <section>
                    <h1>Buttons</h1>
                    <h2>Default</h2>
                    <a class="btn small" href="#">button small</a>
                    <a class="btn medium" href="#">button medium</a>
                    <a class="btn large" href="#">button large</a>
                    <input class="btn large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Primary</h2>
                    <a class="btn primary small" href="#">button small</a>
                    <a class="btn primary medium" href="#">button medium</a>
                    <a class="btn primary large" href="#">button large</a>
                    <input class="btn primary large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Secondary</h2>
                    <a class="btn secondary small" href="#">button small</a>
                    <a class="btn secondary medium" href="#">button medium</a>
                    <a class="btn secondary large" href="#">button large</a>
                    <input class="btn secondary large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Tertiary</h2>
                    <a class="btn tertiary small" href="#">button small</a>
                    <a class="btn tertiary medium" href="#">button medium</a>
                    <a class="btn tertiary large" href="#">button large</a>
                    <input class="btn tertiary large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Quadiary</h2>
                    <a class="btn quadiary small" href="#">button small</a>
                    <a class="btn quadiary medium" href="#">button medium</a>
                    <a class="btn quadiary large" href="#">button large</a>
                    <input class="btn quadiary large" value="button disabled" type="submit" disabled="disabled" />
                </section>

                <section>
                    <h1>Notifications</h1>
                    <p><i>Note: Download proper icons on <a href="http://www.fontello.com">fontello.com</a> and change the icons in the notifications partial.</i></p>
                    <div class="notification error">
                        <ul>
                            <li>Vul een e-mailadres in</li>
                            <li>Eventueel nog een andere error</li>
                            <li>Nog een error</li>
                        </ul>
                    </div>
                    <div class="notification success">
                        <ul>
                            <li>Vul een e-mailadres in</li>
                            <li>Eventueel nog een andere error</li>
                            <li>Nog een error</li>
                        </ul>
                    </div>
                    <div class="notification">
                        <ul>
                            <li>Vul een e-mailadres in</li>
                            <li>Eventueel nog een andere error</li>
                            <li>Nog een error</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h1>Form</h1>
                    <div class="form clearfix">
                        <form class="form-validate" novalidate="novalidate">

                            <fieldset>
                                <legend>Persoonlijke gegevens</legend>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Naam *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Adres</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Postcode</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-3 form-input">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Woonplaats</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix error">
                                    <div class="columns-5 form-label">
                                        <label>Telefoonnummer</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input type="tel" placeholder="0123456789" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>E-mailadres *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input type="email" placeholder="jouwnaam@adres.nl" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Disabled *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input type="email" placeholder="disabled.." disabled="disabled" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Vraag / opmerking</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-10 form-input">
                                            <textarea cols="30" rows="10"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>


                            <fieldset>
                                <legend>Live validation (<a href="http://parsleyjs.org/">http://parsleyjs.org</a>)</legend>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Postcode</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-3 form-input">
                                            <input type="text" placeholder="0123AB" data-regexp="^\d{4}[a-zA-Z]{2}$" data-error-message="Dit is geen geldige postcode." data-maxlength="6" maxlength="6" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Telefoonnummer</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-4 form-input">
                                            <input type="tel" placeholder="0123456789" data-type="digits" data-minlength="10" data-error-message="Dit is geen geldig telefoonnummer." />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>IBAN-nummer (NL)</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-4 form-input">
                                            <input type="tel" placeholder="NL01INGB0123456789" pattern="^(([a-zA-Z]{2}\d{2})?([a-zA-Z]{4}\d{10})|(\d{7}|\d{9,10}))$" data-error-message="Dit is geen gelding IBAN nummer." />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>E-mailadres *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input type="email" placeholder="jouwnaam@adres.nl" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Wachtwoord *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input id="password" type="password" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Herhaal wachtwoord *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input type="password" data-equalto="#password" data-error-message="Wachtwoorden zijn niet identiek." />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Website *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <input type="url" />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <div class="form-actions">
                                <p class="form-required-field"><i>* = Verplicht veld</i></p>
                                <input class="btn primary medium" type="submit" value="verzenden" />
                            </div>
                        </form>
                    </div>
                </section>
            </div>

            <footer class="footer">
                <nav class="nav-footer">
                    <ul class="inline-list">
                        <li class="active"><a href="#">link</a></li>
                        <li><a href="#">link</a></li>
                        <li><a href="#">link</a></li>
                    </ul>
                </nav>
                <div class="copyright">&copy; copyright 2013</div>
            </footer>
        </div>

        <script src="js/main.js"></script>
    </body>
</html>