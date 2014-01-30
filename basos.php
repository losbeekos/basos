<?php include('_header.php'); ?>

                <br/><br/>

                <section>
                    <h1>Grid</h1>
                    <div class="grid">
                        <div class="column-12 column__omega" style="background: rgba(0,0,0,0.1)">column-12</div>
                    </div>
                    <div class="grid">
                        <div class="column-6" style="background: rgba(0,0,0,0.1)">column-6</div>
                        <div class="column-6 column__omega" style="background: rgba(0,0,0,0.1)">column-6</div>
                    </div>
                    <div class="grid">
                        <div class="column-4" style="background: rgba(0,0,0,0.1)">column-4</div>
                        <div class="column-8 column__omega" style="background: rgba(0,0,0,0.1)">column-8</div>
                    </div>
                    <div class="grid">
                        <div class="column-2" style="background: rgba(0,0,0,0.1)">column-2</div>
                        <div class="column-10 column__omega" style="background: rgba(0,0,0,0.1)">column-10</div>
                    </div>
                    <div class="grid">
                        <div class="column-7" style="background: rgba(0,0,0,0.1)">column-7</div>
                        <div class="column-5 column__omega" style="background: rgba(0,0,0,0.1)">column-5</div>
                    </div>
                    <div class="grid">
                        <div class="column-9" style="background: rgba(0,0,0,0.1)">column-9</div>
                        <div class="column-3 column__omega" style="background: rgba(0,0,0,0.1)">column-3</div>
                    </div>
                </section>

                <br/><br/>

                <section>
                    <h1>Buttons</h1>
                    <h2>Alpha</h2>
                    <a class="btn btn__alpha btn__small" href="#">button small</a>
                    <a class="btn btn__alpha btn__medium" href="#">button medium</a>
                    <a class="btn btn__alpha btn__large" href="#">button large</a>
                    <input class="btn btn__alpha btn__large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Beta</h2>
                    <a class="btn btn__beta btn__small" href="#">button small</a>
                    <a class="btn btn__beta btn__medium" href="#">button medium</a>
                    <a class="btn btn__beta btn__large" href="#">button large</a>
                    <input class="btn btn__beta btn__large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Gamma</h2>
                    <a class="btn btn__gamma btn__small" href="#">button small</a>
                    <a class="btn btn__gamma btn__medium" href="#">button medium</a>
                    <a class="btn btn__gamma btn__large" href="#">button large</a>
                    <input class="btn btn__gamma btn__large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Delta</h2>
                    <a class="btn btn__delta btn__small" href="#">button small</a>
                    <a class="btn btn__delta btn__medium" href="#">button medium</a>
                    <a class="btn btn__delta btn__large" href="#">button large</a>
                    <input class="btn btn__delta btn__large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Epsilon</h2>
                    <a class="btn btn__epsilon btn__small" href="#">button small</a>
                    <a class="btn btn__epsilon btn__medium" href="#">button medium</a>
                    <a class="btn btn__epsilon btn__large" href="#">button large</a>
                    <input class="btn btn__epsilon btn__large" value="button disabled" type="submit" disabled="disabled" />

                    <h2>Block button</h2>
                    <div class="grid">
                        <div class="column-6">
                            <a class="btn btn__block btn__beta btn__large" href="#">block button</a>
                        </div>
                        <div class="column-6 column__omega">
                            <a class="btn btn__block btn__beta btn__large" href="#">block button</a>
                        </div>
                    </div>

                    <h2>Button group inline</h2>
                    <p>These work with the button classes so you can use those to change color and size.</p>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__alpha btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__alpha btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__alpha btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__alpha btn__medium" href="#">button</a></li>
                    </ul>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__beta btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__beta btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__beta btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__beta btn__medium" href="#">button</a></li>
                    </ul>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__gamma btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__gamma btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__gamma btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__gamma btn__medium" href="#">button</a></li>
                    </ul>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__delta btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__delta btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__delta btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__delta btn__medium" href="#">button</a></li>
                    </ul>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__epsilon btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__epsilon btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__epsilon btn__medium" href="#">button</a></li>
                        <li><a class="btn btn__epsilon btn__medium" href="#">button</a></li>
                    </ul>

                    <h2>Button group block</h2>
                    <p>These will span there parent column.</p>
                    <div class="grid clearfix">
                        <div class="column-4">
                            <ul class="btn-group btn-group__block">
                                <li><a class="btn btn__alpha btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__alpha btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__alpha btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__alpha btn__medium" href="#">button</a></li>
                            </ul>
                            <ul class="btn-group btn-group__block">
                                <li><a class="btn btn__beta btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__beta btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__beta btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__beta btn__medium" href="#">button</a></li>
                            </ul>
                            <ul class="btn-group btn-group__block">
                                <li><a class="btn btn__gamma btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__gamma btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__gamma btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__gamma btn__medium" href="#">button</a></li>
                            </ul>
                            <ul class="btn-group btn-group__block">
                                <li><a class="btn btn__delta btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__delta btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__delta btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__delta btn__medium" href="#">button</a></li>
                            </ul>
                            <ul class="btn-group btn-group__block">
                                <li><a class="btn btn__epsilon btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__epsilon btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__epsilon btn__medium" href="#">button</a></li>
                                <li><a class="btn btn__epsilon btn__medium" href="#">button</a></li>
                            </ul>
                        </div>
                    </div>
                </section>

                <br/><br/>

                <section>
                    <h1>Notifications</h1>
                    <p>Note: You can download different icons on <a href="http://www.fontello.com">fontello.com</a> and change them in settings.</p>
                    <h2>Alpha</h2>
                    <div class="notification notification__alpha notification__error">
                        <div class="notification--text">Deze account gegevens zijn niet bij ons bekend.</div>
                        <button class="notification--close"></button>
                    </div>
                    <div class="notification notification__alpha notification__success">
                        <div class="notification--text">Je bent nu geregistreerd op onze website.</div>
                        <button class="notification--close"></button>
                    </div>
                    <div class="notification notification__alpha">
                        <div class="notification--text">Je abonnement loopt af op 23-02-2014. <a href="#">Verleng je abonnment</a>.</div>
                        <button class="notification--close"></button>
                    </div>
                    <h2>Beta</h2>
                    <div class="notification notification__beta notification__error">
                        <div class="notification--text">Deze account gegevens zijn niet bij ons bekend.</div>
                        <button class="notification--close"></button>
                    </div>
                    <div class="notification notification__beta notification__success">
                        <div class="notification--text">Je bent nu geregistreerd op onze website.</div>
                        <button class="notification--close"></button>
                    </div>
                    <div class="notification notification__beta">
                        <div class="notification--text">Je abonnement loopt af op 23-02-2014. <a href="#">Verleng je abonnment</a>.</div>
                        <button class="notification--close"></button>
                    </div>
                </section>

                <br/><br/>

                <section>
                    <h1>Form</h1>
                    <form class="form" data-form-validate="true" novalidate="novalidate">
                        <fieldset>
                            <legend>Persoonlijke gegevens</legend>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Aanhef</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <div class="form--select">
                                            <select name="" id="">
                                                <option value="" disabled="disabled" selected="selected">Kies een optie</option>
                                                <option value="">Dhr.</option>
                                                <option value="">Mevr.</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Aanhef</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <select name="" id="" multiple="multiple">
                                            <option value="">HTML</option>
                                            <option value="">CSS</option>
                                            <option value="">Javascript</option>
                                            <option value="">PHP</option>
                                            <option value="">Json</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Naam *</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input type="text" placeholder="" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Adres</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input type="text" placeholder="" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Postcode</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-3 form--input">
                                        <input type="text" placeholder="" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Woonplaats</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input type="text" placeholder="" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row error">
                                <div class="column-5 form--label">
                                    <label>Telefoonnummer</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input type="tel" placeholder="0123456789" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>E-mailadres *</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input type="email" placeholder="jouwnaam@adres.nl" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Some checkboxes</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <ul class="form--input-list list-unstyled">
                                            <li><input name="checkbox" type="checkbox" checked="checked" id="checkbox1" /><label for="checkbox1">Checkbox</label></li>
                                            <li><input name="checkbox" type="checkbox" id="checkbox2" /><label for="checkbox2">Checkbox</label></li>
                                            <li><input name="checkbox" type="checkbox" id="checkbox3" /><label for="checkbox3">Checkbox</label></li>
                                            <li><input name="checkbox" type="checkbox" id="checkbox4" /><label for="checkbox4">Checkbox</label></li>
                                            <li><input name="checkbox" type="checkbox" id="checkbox5" /><label for="checkbox5">Checkbox</label></li>
                                            <li><input name="checkbox" type="checkbox" disabled="disabled" id="checkbox6" /><label for="checkbox6">Checkbox disabled</label></li>
                                            <li><input name="checkbox" type="checkbox" disabled="disabled" id="checkbox7" /><label for="checkbox7">Checkbox disabled</label></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Some radio buttons</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <ul class="form--input-list list-unstyled">
                                            <li><input name="radio" type="radio" name="radio" id="radio1" /><label for="radio1">Radio</label></li>
                                            <li><input name="radio" type="radio" name="radio" id="radio2" /><label for="radio2">Radio</label></li>
                                            <li><input name="radio" type="radio" name="radio" id="radio3" /><label for="radio3">Radio</label></li>
                                            <li><input name="radio" type="radio" name="radio" id="radio4" /><label for="radio4">Radio</label></li>
                                            <li><input name="radio" type="radio" name="radio" id="radio5" /><label for="radio5">Radio</label></li>
                                            <li><input name="radio" type="radio" name="radio" disabled="disabled" id="radio6" /><label for="radio6">Radio disabled</label></li>
                                            <li><input name="radio" type="radio" name="radio" disabled="disabled" id="radio7" /><label for="radio7">Radio disabled</label></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Switch</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--switch">
                                        <ul class="form--input-list list-unstyled">
                                            <li><input name="switch1" type="checkbox" id="switch1" /><label for="switch1">Switch</label></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Switch</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--switch">
                                        <ul class="form--input-list list-unstyled">
                                            <li><input name="switch2" type="checkbox" id="switch2" /><label for="switch2">Switch</label></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Switch</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--switch">
                                        <ul class="form--input-list list-unstyled">
                                            <li><input name="switch3" type="checkbox" id="switch3" /><label for="switch3">Switch</label></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Inline radio buttons *</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <ul class="form--input-list list-inline">
                                            <li><input name="radio1" type="radio" name="radio2" id="radio8" /><label for="radio8">Yes</label></li>
                                            <li><input name="radio2" type="radio" name="radio2" id="radio9" /><label for="radio9">No</label></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Disabled *</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input type="email" placeholder="disabled.." disabled="disabled" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Vraag / opmerking</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-10 form--input">
                                        <textarea cols="30" rows="10"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Form data</label>
                                </div>
                                <div class="column-7 column__omega form--data">Some data</div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Form data</label>
                                </div>
                                <div class="column-7 column__omega form--data">Some data</div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Form data</label>
                                </div>
                                <div class="column-7 column__omega form--data">Some data</div>
                            </div>
                        </fieldset>


                        <fieldset>
                            <legend>Live validation (<a href="http://parsleyjs.org/">http://parsleyjs.org</a>)</legend>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Aanhef</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <div class="form--select">
                                            <select name="aanhef" id="" required="required">
                                                <option value="" disabled="disabled" selected="selected">Kies een optie</option>
                                                <option value="Dhr.">Dhr.</option>
                                                <option value="Mevr.">Mevr.</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Postcode</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-3 form--input">
                                        <input type="text" placeholder="0123AB" parsley-regexp="^\d{4}[a-zA-Z]{2}$" parsley-error-message="Dit is geen geldige postcode." parsley-maxlength="6" maxlength="6" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Telefoonnummer</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-4 form--input">
                                        <input type="tel" placeholder="0123456789" parsley-type="digits" parsley-minlength="10" parsley-error-message="Dit is geen geldig telefoonnummer." />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>IBAN-nummer (NL)</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-4 form--input">
                                        <input type="tel" placeholder="NL01INGB0123456789" pattern="^(([a-zA-Z]{2}\d{2})?([a-zA-Z]{4}\d{10})|(\d{7}|\d{9,10}))$" parsley-error-message="Dit is geen gelding IBAN nummer." />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>E-mailadres *</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input type="email" placeholder="jouwnaam@adres.nl" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Wachtwoord *</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input id="password" type="password" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Herhaal wachtwoord *</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input type="password" parsley-equalto="#password" parsley-error-message="Wachtwoorden zijn niet identiek." />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Website *</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <input type="url" />
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Some checkboxes</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <ul class="form--input-list list-unstyled">
                                            <li><input name="checkbox2" type="checkbox" checked="checked" id="checkbox10" parsley-mincheck="2" /><label for="checkbox10">Checkbox</label></li>
                                            <li><input name="checkbox2" type="checkbox" id="checkbox11" /><label for="checkbox11">Checkbox</label></li>
                                            <li><input name="checkbox2" type="checkbox" id="checkbox12" /><label for="checkbox12">Checkbox</label></li>
                                            <li><input name="checkbox2" type="checkbox" id="checkbox13" /><label for="checkbox13">Checkbox</label></li>
                                            <li><input name="checkbox2" type="checkbox" id="checkbox14" /><label for="checkbox14">Checkbox</label></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="form--row">
                                <div class="column-5 form--label">
                                    <label>Some radio buttons</label>
                                </div>
                                <div class="column-7 column__omega">
                                    <div class="column-6 form--input">
                                        <ul class="form--input-list list-unstyled">
                                            <li><input required="required" name="radio" type="radio" name="radio" id="radio13" /><label for="radio13">Radio</label></li>
                                            <li><input name="radio" type="radio" name="radio" id="radio14" /><label for="radio14">Radio</label></li>
                                            <li><input name="radio" type="radio" name="radio" id="radio10" /><label for="radio10">Radio</label></li>
                                            <li><input name="radio" type="radio" name="radio" id="radio11" /><label for="radio11">Radio</label></li>
                                            <li><input name="radio" type="radio" name="radio" id="radio12" /><label for="radio12">Radio</label></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <div class="form--actions">
                            <p class="form--required-field"><i>* = Verplicht veld</i></p>
                            <input class="btn btn__beta btn__medium" type="submit" value="verzenden" />
                        </div>
                    </form>
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
                    <table class="table table__hover">
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
                    <table class="table table__zebra">
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
                    <table class="table table__bordered">
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
                    <table class="table table__zebra table__bordered">
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
                    <h1>Pagination</h1>
                    <p>These work with the button classes so you can use those to change color, size is controlled with specific pagination padding.</p>
                    <h2>Default pagination</h2>
                    <div class="btn-container">
                        <a class="btn btn__alpha" href="#">&lsaquo;</a>
                        <a class="btn btn__alpha" href="#">1</a>
                        <a class="btn btn__alpha" href="#">2</a>
                        <a class="btn btn__alpha" href="#">3</a>
                        <a class="btn btn__alpha" href="#">4</a>
                        <a class="btn btn__alpha" href="#">5</a>
                        <a class="btn btn__divider">...</a>
                        <a class="btn btn__alpha" href="#">23</a>
                        <a class="btn btn__alpha" href="#">&rsaquo;</a>
                    </div>
                    <h2>Centered pagination</h2>
                    <div class="btn-container btn-container__center">
                        <a class="btn btn__alpha" href="#">&lsaquo;</a>
                        <a class="btn btn__alpha" href="#">1</a>
                        <a class="btn btn__alpha" href="#">2</a>
                        <a class="btn btn__alpha" href="#">3</a>
                        <a class="btn btn__alpha" href="#">4</a>
                        <a class="btn btn__alpha" href="#">5</a>
                        <a class="btn btn__divider">...</a>
                        <a class="btn btn__alpha" href="#">23</a>
                        <a class="btn btn__alpha" href="#">&rsaquo;</a>
                    </div>
                    <h2>Right pagination</h2>
                    <div class="btn-container btn-container__right">
                        <a class="btn btn__alpha" href="#">&lsaquo;</a>
                        <a class="btn btn__alpha" href="#">1</a>
                        <a class="btn btn__alpha" href="#">2</a>
                        <a class="btn btn__alpha" href="#">3</a>
                        <a class="btn btn__alpha" href="#">4</a>
                        <a class="btn btn__alpha" href="#">5</a>
                        <a class="btn btn__divider">...</a>
                        <a class="btn btn__alpha" href="#">23</a>
                        <a class="btn btn__alpha" href="#">&rsaquo;</a>
                    </div>
                    <h2>Button group pagination</h2>
                    <div class="btn-container">
                        <ul class="btn-group btn-group__inline">
                            <li><a class="btn btn__alpha" href="#">&lsaquo;</a></li>
                            <li><a class="btn btn__alpha" href="#">1</a></li>
                            <li><a class="btn btn__alpha" href="#">2</a></li>
                            <li><a class="btn btn__alpha" href="#">3</a></li>
                            <li><a class="btn btn__alpha" href="#">4</a></li>
                            <li><a class="btn btn__alpha" href="#">5</a></li>
                            <li><a class="btn btn__divider">...</a></li>
                            <li><a class="btn btn__alpha" href="#">23</a></li>
                            <li><a class="btn btn__alpha" href="#">&rsaquo;</a></li>
                        </ul>
                    </div>
                    <h2>Centered button group pagination</h2>
                    <div class="btn-container btn-container__center">
                        <ul class="btn-group btn-group__inline">
                            <li><a class="btn btn__alpha" href="#">&lsaquo;</a></li>
                            <li><a class="btn btn__alpha" href="#">1</a></li>
                            <li><a class="btn btn__alpha" href="#">2</a></li>
                            <li><a class="btn btn__alpha" href="#">3</a></li>
                            <li><a class="btn btn__alpha" href="#">4</a></li>
                            <li><a class="btn btn__alpha" href="#">5</a></li>
                            <li><a class="btn btn__divider">...</a></li>
                            <li><a class="btn btn__alpha" href="#">23</a></li>
                            <li><a class="btn btn__alpha" href="#">&rsaquo;</a></li>
                        </ul>
                    </div>
                    <h2>Right button group pagination</h2>
                    <div class="btn-container btn-container__right">
                        <ul class="btn-group btn-group__inline">
                            <li><a class="btn btn__alpha" href="#">&lsaquo;</a></li>
                            <li><a class="btn btn__alpha" href="#">1</a></li>
                            <li><a class="btn btn__alpha" href="#">2</a></li>
                            <li><a class="btn btn__alpha" href="#">3</a></li>
                            <li><a class="btn btn__alpha" href="#">4</a></li>
                            <li><a class="btn btn__alpha" href="#">5</a></li>
                            <li><a class="btn btn__divider">...</a></li>
                            <li><a class="btn btn__alpha" href="#">23</a></li>
                            <li><a class="btn btn__alpha" href="#">&rsaquo;</a></li>
                        </ul>
                    </div>
                </section>

                <br/><br/>

                <section>
                    <h1>Breadcrumbs</h1>
                    <div class="breadcrumbs">
                        <a href="#">Home</a>
                        <a href="#">Lorem</a>
                        <span>Ipsum dolir asmit emet</span>
                    </div>
                </section>

                <br/><br/>

                <section>
                    <h1>Tabs</h1>
                    <ul class="tabs">
                        <li><a class="tab tab__active" href="#tab-home">Home</a></li>
                        <li><a class="tab" href="#tab-lorem">Lorem</a></li>
                        <li><a class="tab" href="#tab-ipsum">Ipsum</a></li>
                    </ul>
                    <div class="tab-content">
                        <div class="tab-item tab-item__active" id="tab-home">
                            <div class="grid">
                                <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                <div class="column-6 column__omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                            </div>
                        </div>
                        <div class="tab-item" id="tab-lorem">
                            <p>Ut pharetra ante id lobortis ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus ac sapien vel purus porta hendrerit. Nulla lacinia ac erat id tempor. Donec felis lorem, hendrerit eu placerat condimentum, faucibus sed metus. Nullam rutrum rutrum odio tempus convallis. Integer tempus lacus libero, non suscipit lacus mattis quis. Nam massa risus, scelerisque at libero non, dapibus lacinia neque. Quisque eu nulla at nunc blandit lobortis. Proin viverra metus tellus, non mollis est elementum ac. Proin elit dolor, gravida vel ipsum sit amet, varius aliquam ipsum</p>
                        </div>
                        <div class="tab-item" id="tab-ipsum">
                            <div class="grid">
                                <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                <div class="column-6 column__omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                            </div>
                            <div class="grid">
                                <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                <div class="column-6 column__omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                            </div>
                        </div>
                    </div>
                </section>

                <br/><br/>

                <section>
                    <h1>Media</h1>
                    <h2>Left</h2>
                    <div class="media media__left">
                        <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                        <div class="media--beta">
                            <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                            <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                        </div>
                    </div>
                    <h2>Right</h2>
                    <div class="media media__right">
                        <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                        <div class="media--beta">
                            <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                            <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                        </div>
                    </div>
                    <h3>Nested</h3>
                    <div class="media media__left">
                        <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                        <div class="media--beta">
                            <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                            <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                            <div class="media media__left">
                                <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                                <div class="media--beta">
                                    <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                    <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                </div>
                            </div>
                            <div class="media media__left">
                                <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                                <div class="media--beta">
                                    <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                    <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h2>List</h2>
                    <ul class="media-list">
                        <li class="media media__left">
                            <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                            <div class="media--beta">
                                <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                            </div>
                        </li>
                        <li class="media media__left">
                            <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                            <div class="media--beta">
                                <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                            </div>
                        </li>
                    </ul>
                    <h2>Bordered list</h2>
                    <ul class="media-list media-list__bordered">
                        <li class="media media__left">
                            <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                            <div class="media--beta">
                                <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                            </div>
                        </li>
                        <li class="media media__left">
                            <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                            <div class="media--beta">
                                <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                <div class="media media__left">
                                    <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                                    <div class="media--beta">
                                        <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                        <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                    </div>
                                </div>
                                <div class="media media__left">
                                    <div class="media--alpha"><img src="http://placehold.it/400x300/e8e8e8/cfcfcf&text=basos" alt="" /></div>
                                    <div class="media--beta">
                                        <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                        <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>

                <br/><br/>

                <section>
                    <h1>Tooltips</h1>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__alpha btn__small tooltip" data-tooltip-position="top" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">top</a></li>
                        <li><a class="btn btn__alpha btn__small tooltip" data-tooltip-position="right" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">right</a></li>
                        <li><a class="btn btn__alpha btn__small tooltip" data-tooltip-position="bottom" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">bottom</a></li>
                        <li><a class="btn btn__alpha btn__small tooltip" data-tooltip-position="left" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">left</a></li>
                        <li><a class="btn btn__alpha btn__small tooltip" data-tooltip-position="top" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness." data-tooltip-trigger="click">click trigger</a></li>
                    </ul>
                </section>

                <br/><br/>

                <section>
                    <h1>Dropdowns</h1>
                    <ul class="btn-group btn-group__inline">
                        <li>
                            <div class="dropdown">
                                <a class="btn btn__alpha btn__small">dropdown</a>
                                <div class="dropdown--content">
                                    <ul>
                                        <li><a href="#">Why not indeed</a></li>
                                        <li><a href="#">link</a></li>
                                        <li><a href="#">link</a></li>
                                        <li><a href="#">link</a></li>
                                        <li><a href="#">link</a></li>
                                    </ul>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="dropdown">
                                <a class="btn btn__alpha btn__small">dropdown</a>
                                <div class="dropdown--content">
                                    <ul>
                                        <li><a href="#">Why not indeed</a></li>
                                        <li><a href="#">link</a></li>
                                        <li><a href="#">link</a></li>
                                        <li><a href="#">link</a></li>
                                        <li><a href="#">link</a></li>
                                    </ul>
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>

                <br/><br/>

                <section>
                    <h1>Modals</h1>
                    <br />
                    <h2 class="h3">Slip effects</h2>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-1">slip-top</a></li>
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-2">slip-bottom</a></li>
                    </ul>
                    <br />
                    <h2 class="h3">Slide effects</h2>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-3">slide-top</a></li>
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-4">slide-right</a></li>
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-5">slide-bottom</a></li>
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-6">slide-left</a></li>
                    </ul>
                    <br />
                    <h2 class="h3">Flip effects</h2>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-7">flip-horizontal</a></li>
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-8">flip-vertical</a></li>
                    </ul>
                    <br />
                    <h2 class="h3">Scale effects</h2>
                    <ul class="btn-group btn-group__inline">
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-9">fadescale</a></li>
                        <li><a class="btn btn__alpha btn__small modal--trigger" data-modal-id="modal-10">superscaled</a></li>
                    </ul>
                </section>

                <br/><br/>

                <section>
                    <h1>Accordion</h1>
                    <div class="accordion">
                        <div class="accordion--group">
                            <a class="accordion--trigger">Accordion item #1</a>
                            <div class="accordion--content accordion-content__show">
                                <p>You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                            </div>
                        </div>
                        <div class="accordion--group">
                            <a class="accordion--trigger">Accordion item #2</a>
                            <div class="accordion--content">
                                <p>You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                            </div>
                        </div>
                        <div class="accordion--group">
                            <a class="accordion--trigger">Accordion item #3</a>
                            <div class="accordion--content">
                                <p>You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                            </div>
                        </div>
                        <div class="accordion--group">
                            <a class="accordion--trigger">Accordion item #4</a>
                            <div class="accordion--content">
                                <h2>With a grid inside</h2>
                                <div class="grid">
                                    <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                    <div class="column-6 column__omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                </div>
                                <div class="grid">
                                    <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                    <div class="column-6 column__omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <br/><br/>

            </main>

            <footer class="footer">
                <ul class="nav-footer list-inline">
                    <li><a class="nav-footer--link nav-footer--link__active" href="#">link</a></li>
                    <li><a class="nav-footer--link" href="#">link</a></li>
                    <li><a class="nav-footer--link" href="#">link</a></li>
                </ul>
                <div class="copyright">&copy; copyright 2013</div>
            </footer>
        </div>

        <div id="modal-1" class="modal" data-modal-effect="slip-top">
            <div class="modal--content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-2" class="modal" data-modal-effect="slip-bottom">
            <div class="modal--content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-3" class="modal" data-modal-effect="slide-top">
            <div class="modal--content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-4" class="modal" data-modal-effect="slide-right">
            <div class="modal--content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-5" class="modal" data-modal-effect="slide-bottom">
            <div class="modal--content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-6" class="modal" data-modal-effect="slide-left">
            <div class="modal--content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-7" class="modal" data-modal-effect="flip-horizontal">
            <div class="modal--content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-8" class="modal" data-modal-effect="flip-vertical">
            <div class="modal--content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-9" class="modal" data-modal-effect="fadescale">
            <div class="modal--content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>
        <div id="modal-10" class="modal" data-modal-effect="superscale">
            <div class="modal--content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn__beta btn__medium modal-close">Akkoord</a>
            </div>
        </div>

        <script src="js/main.js"></script>
    </body>
</html>