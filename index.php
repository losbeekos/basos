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
            <div class="notification error">
                <ul>
                    <li>You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</li>
                </ul>
            </div>
        <![endif]-->

        <div class="container">
            <header class="header">
                <a class="logo" href="/"><img src="img/logo.png" alt="" /></a>
                <nav class="nav-primary">
                    <ul class="list-inline">
                        <li class="active"><a href="#">link</a></li>
                        <li><a href="#">link</a></li>
                        <li><a href="#">link</a></li>
                    </ul>
                </nav>
            </header>

            <div class="content">

                <br/><br/>

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

                <br/><br/>

                <section>
                    <h1>Buttons</h1>
                    <h2>Default</h2>
                    <a class="btn btn-small" href="#">button small</a>
                    <a class="btn btn-medium" href="#">button medium</a>
                    <a class="btn btn-large" href="#">button large</a>
                    <input class="btn btn-large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Primary</h2>
                    <a class="btn btn-primary btn-small" href="#">button small</a>
                    <a class="btn btn-primary btn-medium" href="#">button medium</a>
                    <a class="btn btn-primary btn-large" href="#">button large</a>
                    <input class="btn btn-primary btn-large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Secondary</h2>
                    <a class="btn btn-secondary btn-small" href="#">button small</a>
                    <a class="btn btn-secondary btn-medium" href="#">button medium</a>
                    <a class="btn btn-secondary btn-large" href="#">button large</a>
                    <input class="btn btn-secondary btn-large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Tertiary</h2>
                    <a class="btn btn-tertiary btn-small" href="#">button small</a>
                    <a class="btn btn-tertiary btn-medium" href="#">button medium</a>
                    <a class="btn btn-tertiary btn-large" href="#">button large</a>
                    <input class="btn btn-tertiary btn-large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Quadiary</h2>
                    <a class="btn btn-quadiary btn-small" href="#">button small</a>
                    <a class="btn btn-quadiary btn-medium" href="#">button medium</a>
                    <a class="btn btn-quadiary btn-large" href="#">button large</a>
                    <input class="btn btn-quadiary btn-large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Block button</h2>
                    <div class="grid clearfix">
                        <div class="columns-6">
                            <a class="btn btn-block btn-primary btn-large" href="#">block button</a>
                        </div>
                        <div class="columns-6 omega">
                            <a class="btn btn-block btn-primary btn-large" href="#">block button</a>
                        </div>
                    </div>
                </section>

                <br/><br/>

                <section>
                    <h1>Notifications</h1>
                    <p><i>Note: Download proper icons on <a href="http://www.fontello.com">fontello.com</a> and change the icons in settings.</i></p>
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

                <br/><br/>

                <section>
                    <h1>Form</h1>
                    <div class="form clearfix">
                        <form class="form-validate" novalidate="novalidate">

                            <fieldset>
                                <legend>Persoonlijke gegevens</legend>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Aanhef</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <select name="" id="">
                                                <option value="">Dhr.</option>
                                                <option value="">Mevr.</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
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
                                        <label>Some checkboxes *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <ul class="form-input-list list-unstyled">
                                                <li><label><input type="checkbox" data-group="checkbox-group-name" /> Checkbox #1</label></li>
                                                <li><label><input type="checkbox" data-group="checkbox-group-name" /> Checkbox #2</label></li>
                                                <li><label><input type="checkbox" data-group="checkbox-group-name" /> Checkbox #3</label></li>
                                                <li><label><input type="checkbox" data-group="checkbox-group-name" /> Checkbox #4</label></li>
                                                <li><label><input type="checkbox" data-group="checkbox-group-name" /> Checkbox #5</label></li>
                                                <li><label><input type="checkbox" data-group="checkbox-group-name" disabled="disabled" /> Disabled #6</label></li>
                                                <li><label><input type="checkbox" data-group="checkbox-group-name" disabled="disabled" /> Disabled #7</label></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Some radio buttons *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <ul class="form-input-list list-unstyled">
                                                <li><label><input type="radio" data-group="radio-group-name" /> Radio #1</label></li>
                                                <li><label><input type="radio" data-group="radio-group-name" /> Radio #2</label></li>
                                                <li><label><input type="radio" data-group="radio-group-name" /> Radio #3</label></li>
                                                <li><label><input type="radio" data-group="radio-group-name" /> Radio #4</label></li>
                                                <li><label><input type="radio" data-group="radio-group-name" /> Radio #5</label></li>
                                                <li><label><input type="radio" data-group="radio-group-name" disabled="disabled" /> Disabled #6</label></li>
                                                <li><label><input type="radio" data-group="radio-group-name" disabled="disabled" /> Disabled #7</label></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row clearfix">
                                    <div class="columns-5 form-label">
                                        <label>Inline radio buttons *</label>
                                    </div>
                                    <div class="columns-7 omega">
                                        <div class="columns-6 form-input">
                                            <ul class="form-input-list list-inline">
                                                <li><label><input type="radio" data-group="radio-group-name" /> Yes</label></li>
                                                <li><label><input type="radio" data-group="radio-group-name" /> No</label></li>
                                            </ul>
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
                                <input class="btn btn-primary btn-medium" type="submit" value="verzenden" />
                            </div>
                        </form>
                    </div>
                </section>

                <br /><br />

                <section>
                    <h1>Tables</h1>
                    <h2>Default table</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Show</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Bender</td>
                                <td>Rodrigues</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Philip</td>
                                <td>Fry</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Jerry</td>
                                <td>Seinfeld</td>
                                <td>Seinfeld</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Larry</td>
                                <td>David</td>
                                <td>Seinfeld</td>
                            </tr>
                        </tbody>
                    </table>
                    <h2>Hover table</h2>
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Show</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Bender</td>
                                <td>Rodrigues</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Philip</td>
                                <td>Fry</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Jerry</td>
                                <td>Seinfeld</td>
                                <td>Seinfeld</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Larry</td>
                                <td>David</td>
                                <td>Seinfeld</td>
                            </tr>
                        </tbody>
                    </table>
                    <h2>Zebra table</h2>
                    <table class="table table-zebra">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Show</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Bender</td>
                                <td>Rodrigues</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Philip</td>
                                <td>Fry</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Jerry</td>
                                <td>Seinfeld</td>
                                <td>Seinfeld</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Larry</td>
                                <td>David</td>
                                <td>Seinfeld</td>
                            </tr>
                        </tbody>
                    </table>
                    <h2>Bordered table</h2>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Show</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Bender</td>
                                <td>Rodrigues</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Philip</td>
                                <td>Fry</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Jerry</td>
                                <td>Seinfeld</td>
                                <td>Seinfeld</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Larry</td>
                                <td>David</td>
                                <td>Seinfeld</td>
                            </tr>
                        </tbody>
                    </table>
                    <h2>Zebra & bordered table</h2>
                    <table class="table table-zebra table-bordered">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Show</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Bender</td>
                                <td>Rodrigues</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Philip</td>
                                <td>Fry</td>
                                <td>Futurama</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Jerry</td>
                                <td>Seinfeld</td>
                                <td>Seinfeld</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Larry</td>
                                <td>David</td>
                                <td>Seinfeld</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <br/><br/>

                <section>
                    <h1>Tooltips</h1>
                    <a class="tooltip btn btn-small" data-tooltip-position="top" data-tooltip-content="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">top</a>
                    <a class="tooltip btn btn-small" data-tooltip-position="right" data-tooltip-content="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">right</a>
                    <a class="tooltip btn btn-small" data-tooltip-position="bottom" data-tooltip-content="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">bottom</a>
                    <a class="tooltip btn btn-small" data-tooltip-position="left" data-tooltip-content="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">left</a>
                    <a class="tooltip btn btn-small" data-tooltip-position="top" data-tooltip-content="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness." data-tooltip-trigger="click">click trigger</a>
                </section>

                <br/><br/>

                <section>
                    <h1>Modals</h1>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-1">slip-top</a>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-2">slip-bottom</a>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-3">slide-top</a>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-4">slide-right</a>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-5">slide-bottom</a>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-6">slide-left</a>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-7">flip-horizontal</a>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-8">flip-vertical</a>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-9">fadescale</a>
                    <a class="btn btn-small modal-trigger" data-modal-id="modal-10">superscaled</a>
                </section>

                <br/><br/>

                <section>
                    <h1>Accordion</h1>
                    <div class="accordion">
                        <div class="accordion-group">
                            <a class="accordion-trigger">Accordion item #1</a>
                            <div class="accordion-content">
                                <p>You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                            </div>
                        </div>
                        <div class="accordion-group">
                            <a class="accordion-trigger">Accordion item #2</a>
                            <div class="accordion-content">
                                <p>You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                            </div>
                        </div>
                        <div class="accordion-group">
                            <a class="accordion-trigger">Accordion item #3</a>
                            <div class="accordion-content">
                                <p>You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                            </div>
                        </div>
                        <div class="accordion-group">
                            <a class="accordion-trigger">Accordion item #4</a>
                            <div class="accordion-content">
                                <h2>With a grid inside</h2>
                                <div class="grid clearfix">
                                    <div class="columns-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                    <div class="columns-6 omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                </div>
                                <div class="grid clearfix">
                                    <div class="columns-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                    <div class="columns-6 omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <br/><br/>

            </div>

            <footer class="footer">
                <nav class="nav-footer">
                    <ul class="list-inline">
                        <li class="active"><a href="#">link</a></li>
                        <li><a href="#">link</a></li>
                        <li><a href="#">link</a></li>
                    </ul>
                </nav>
                <div class="copyright">&copy; copyright 2013</div>
            </footer>
        </div>

        <div id="modal-1" class="modal" data-modal-effect="slip-top">
            <div class="modal-content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-2" class="modal" data-modal-effect="slip-bottom">
            <div class="modal-content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-3" class="modal" data-modal-effect="slide-top">
            <div class="modal-content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-4" class="modal" data-modal-effect="slide-right">
            <div class="modal-content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-5" class="modal" data-modal-effect="slide-bottom">
            <div class="modal-content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-6" class="modal" data-modal-effect="slide-left">
            <div class="modal-content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-7" class="modal" data-modal-effect="flip-horizontal">
            <div class="modal-content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-8" class="modal" data-modal-effect="flip-vertical">
            <div class="modal-content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-9" class="modal" data-modal-effect="fadescale">
            <div class="modal-content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-10" class="modal" data-modal-effect="superscale">
            <div class="modal-content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn-primary btn-medium modal-close">Akkoord</a>
            </div>
        </div>

        <script src="js/main.js"></script>
    </body>
</html>