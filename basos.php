<?php include('_header.php'); ?>

                    <br/><br/>

                    <section id="grid">
                        <h1>Grid</h1>
                        <div class="grid">
                            <div class="column-12 column--omega" style="background: rgba(0,0,0,0.03)">column-12</div>
                        </div>
                        <div class="grid">
                            <div class="column-6" style="background: rgba(0,0,0,0.03)">column-6</div>
                            <div class="column-6 column--omega" style="background: rgba(0,0,0,0.03)">column-6</div>
                        </div>
                        <div class="grid">
                            <div class="column-4" style="background: rgba(0,0,0,0.03)">column-4</div>
                            <div class="column-8 column--omega" style="background: rgba(0,0,0,0.03)">column-8</div>
                        </div>
                        <div class="grid">
                            <div class="column-2" style="background: rgba(0,0,0,0.03)">column-2</div>
                            <div class="column-10 column--omega" style="background: rgba(0,0,0,0.03)">column-10</div>
                        </div>
                        <div class="grid">
                            <div class="column-7" style="background: rgba(0,0,0,0.03)">column-7</div>
                            <div class="column-5 column--omega" style="background: rgba(0,0,0,0.03)">column-5</div>
                        </div>
                        <div class="grid">
                            <div class="column-9" style="background: rgba(0,0,0,0.03)">column-9</div>
                            <div class="column-3 column--omega" style="background: rgba(0,0,0,0.03)">column-3</div>
                        </div>
                    </section>

                    <br/><br/>

                    <section id="buttons">
                        <h1>Buttons</h1>
                        <h2>Alpha</h2>
                        <a class="btn btn--alpha btn--small" href="#">button small</a>
                        <a class="btn btn--alpha btn--medium" href="#">button medium</a>
                        <a class="btn btn--alpha btn--large" href="#">button large</a>
                        <input class="btn btn--alpha btn--large" value="button disabled" type="submit" disabled="disabled" />

                        <h2>Beta</h2>
                        <a class="btn btn--beta btn--small" href="#">button small</a>
                        <a class="btn btn--beta btn--medium" href="#">button medium</a>
                        <a class="btn btn--beta btn--large" href="#">button large</a>
                        <input class="btn btn--beta btn--large" value="button disabled" type="submit" disabled="disabled" />

                        <h2>Gamma</h2>
                        <a class="btn btn--gamma btn--small" href="#">button small</a>
                        <a class="btn btn--gamma btn--medium" href="#">button medium</a>
                        <a class="btn btn--gamma btn--large" href="#">button large</a>
                        <input class="btn btn--gamma btn--large" value="button disabled" type="submit" disabled="disabled" />

                        <h2>Delta</h2>
                        <a class="btn btn--delta btn--small" href="#">button small</a>
                        <a class="btn btn--delta btn--medium" href="#">button medium</a>
                        <a class="btn btn--delta btn--large" href="#">button large</a>
                        <input class="btn btn--delta btn--large" value="button disabled" type="submit" disabled="disabled" />

                        <h2>Epsilon</h2>
                        <a class="btn btn--epsilon btn--small" href="#">button small</a>
                        <a class="btn btn--epsilon btn--medium" href="#">button medium</a>
                        <a class="btn btn--epsilon btn--large" href="#">button large</a>
                        <input class="btn btn--epsilon btn--large" value="button disabled" type="submit" disabled="disabled" />

                        <h2>Block button</h2>
                        <div class="grid">
                            <div class="column-6">
                                <a class="btn btn--block btn--beta btn--large" href="#">block button</a>
                            </div>
                            <div class="column-6 column--omega">
                                <a class="btn btn--block btn--beta btn--large" href="#">block button</a>
                            </div>
                        </div>

                        <h2>Button group inline</h2>
                        <p>These work with the button classes so you can use those to change color and size.</p>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--alpha btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--alpha btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--alpha btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--alpha btn--medium" href="#">button</a></li>
                        </ul>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--beta btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--beta btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--beta btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--beta btn--medium" href="#">button</a></li>
                        </ul>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--gamma btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--gamma btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--gamma btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--gamma btn--medium" href="#">button</a></li>
                        </ul>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--delta btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--delta btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--delta btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--delta btn--medium" href="#">button</a></li>
                        </ul>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--epsilon btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--epsilon btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--epsilon btn--medium" href="#">button</a></li>
                            <li><a class="btn btn--epsilon btn--medium" href="#">button</a></li>
                        </ul>

                        <h2>Button group block</h2>
                        <p>These will span there parent column.</p>
                        <div class="grid clearfix">
                            <div class="column-4">
                                <ul class="btn-group btn-group--block">
                                    <li><a class="btn btn--alpha btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--alpha btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--alpha btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--alpha btn--medium" href="#">button</a></li>
                                </ul>
                                <ul class="btn-group btn-group--block">
                                    <li><a class="btn btn--beta btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--beta btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--beta btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--beta btn--medium" href="#">button</a></li>
                                </ul>
                                <ul class="btn-group btn-group--block">
                                    <li><a class="btn btn--gamma btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--gamma btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--gamma btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--gamma btn--medium" href="#">button</a></li>
                                </ul>
                                <ul class="btn-group btn-group--block">
                                    <li><a class="btn btn--delta btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--delta btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--delta btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--delta btn--medium" href="#">button</a></li>
                                </ul>
                                <ul class="btn-group btn-group--block">
                                    <li><a class="btn btn--epsilon btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--epsilon btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--epsilon btn--medium" href="#">button</a></li>
                                    <li><a class="btn btn--epsilon btn--medium" href="#">button</a></li>
                                </ul>
                            </div>
                        </div>

                        <h2>Button element style reset</h2>
                        <p>Commonly used for triggers. For example a navigation trigger.</p>
                        <button class="no-button-style">Button</button>
                    </section>

                    <br/><br/>

                    <section id="notification">
                        <h1>Notifications</h1>
                        <p>Note: You can download different icons on <a href="http://www.fontello.com">fontello.com</a> and change them in settings.</p>
                        <h2>Alpha</h2>
                        <div class="notification notification--alpha notification--error">
                            <div class="notification__text">Deze account gegevens zijn niet bij ons bekend.</div>
                            <button class="notification__close" data-notification-close></button>
                        </div>
                        <div class="notification notification--alpha notification--success">
                            <div class="notification__text">Je bent nu geregistreerd op onze website.</div>
                            <button class="notification__close" data-notification-close></button>
                        </div>
                        <div class="notification notification--alpha">
                            <div class="notification__text">Je abonnement loopt af op 23-02-2014. <a href="#">Verleng je abonnment</a>.</div>
                            <button class="notification__close" data-notification-close></button>
                        </div>
                        <h2>Beta</h2>
                        <div class="notification notification--beta notification--error">
                            <div class="notification__text">Deze account gegevens zijn niet bij ons bekend.</div>
                            <button class="notification__close" data-notification-close></button>
                        </div>
                        <div class="notification notification--beta notification--success">
                            <div class="notification__text">Je bent nu geregistreerd op onze website.</div>
                            <button class="notification__close" data-notification-close></button>
                        </div>
                        <div class="notification notification--beta">
                            <div class="notification__text">Je abonnement loopt af op 23-02-2014. <a href="#">Verleng je abonnment</a>.</div>
                            <button class="notification__close" data-notification-close></button>
                        </div>
                    </section>

                    <br/><br/>

                    <section id="form">
                        <h1>Form</h1>
                        <form class="form" data-form-validate novalidate="novalidate">
                            <fieldset>
                                <legend>Persoonlijke gegevens</legend>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Aanhef</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <div class="form__select">
                                                <select name="" id="">
                                                    <option value="" disabled="disabled" selected="selected">Kies een optie</option>
                                                    <option value="">Dhr.</option>
                                                    <option value="">Mevr.</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Aanhef</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
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
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Naam *</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Adres</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Postcode</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-3 form__input">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Woonplaats</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input type="text" placeholder="" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Telefoonnummer</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input type="tel" placeholder="0123456789" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>E-mailadres *</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input type="email" placeholder="jouwnaam@adres.nl" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Some checkboxes</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <ul class="form__input-list list-unstyled">
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
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Some radio buttons</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <ul class="form__input-list list-unstyled">
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
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Switch</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__switch">
                                            <ul class="form__input-list list-unstyled">
                                                <li><input name="switch1" type="checkbox" id="switch1" /><label for="switch1">Switch</label></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Switch</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__switch">
                                            <ul class="form__input-list list-unstyled">
                                                <li><input name="switch2" type="checkbox" id="switch2" /><label for="switch2">Switch</label></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Switch</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__switch">
                                            <ul class="form__input-list list-unstyled">
                                                <li><input name="switch3" type="checkbox" id="switch3" /><label for="switch3">Switch</label></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Inline radio buttons *</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <ul class="form__input-list list-inline">
                                                <li><input name="radio1" type="radio" name="radio1" id="radio8" /><label for="radio8">Yes</label></li>
                                                <li><input name="radio1" type="radio" name="radio1" id="radio9" /><label for="radio9">No</label></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Disabled *</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input type="email" placeholder="disabled.." disabled="disabled" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Vraag / opmerking</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-10 form__input">
                                            <textarea cols="30" rows="10"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Form data</label>
                                    </div>
                                    <div class="column-7 column--omega form__data">Some data</div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Form data</label>
                                    </div>
                                    <div class="column-7 column--omega form__data">Some data</div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Form data</label>
                                    </div>
                                    <div class="column-7 column--omega form__data">Some data</div>
                                </div>
                            </fieldset>


                            <fieldset>
                                <legend>Live validation (<a href="http://parsleyjs.org/">http://data-parsleyjs.org</a>)</legend>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Aanhef</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <div class="form__select">
                                                <select name="aanhef" id="" required="required">
                                                    <option value="" disabled="disabled" selected="selected">Kies een optie</option>
                                                    <option value="Dhr.">Dhr.</option>
                                                    <option value="Mevr.">Mevr.</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Postcode</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-3 form__input">
                                            <input type="text" placeholder="0123AB" data-parsley-pattern="^\d{4}[a-zA-Z]{2}$" data-parsley-error-message="Dit is geen geldige postcode." data-parsley-maxlength="6" maxlength="6" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Telefoonnummer</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-4 form__input">
                                            <input type="tel" placeholder="0123456789" data-parsley-type="digits" data-parsley-minlength="10" data-parsley-error-message="Dit is geen geldig telefoonnummer." />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>IBAN-nummer (NL)</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-4 form__input">
                                            <input type="tel" placeholder="NL01INGB0123456789" pattern="^(([a-zA-Z]{2}\d{2})?([a-zA-Z]{4}\d{10})|(\d{7}|\d{9,10}))$" data-parsley-error-message="Dit is geen gelding IBAN nummer." />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>E-mailadres *</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input type="email" placeholder="jouwnaam@adres.nl" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Wachtwoord *</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input id="password" type="password" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Herhaal wachtwoord *</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input type="password" data-parsley-equalto="#password" data-parsley-error-message="Wachtwoorden zijn niet identiek." />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Website *</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <input type="url" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Some checkboxes</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <ul class="form__input-list list-unstyled">
                                                <li><input name="checkbox2" type="checkbox" checked="checked" id="checkbox10" data-parsley-mincheck="2" /><label for="checkbox10">Checkbox</label></li>
                                                <li><input name="checkbox2" type="checkbox" id="checkbox11" /><label for="checkbox11">Checkbox</label></li>
                                                <li><input name="checkbox2" type="checkbox" id="checkbox12" /><label for="checkbox12">Checkbox</label></li>
                                                <li><input name="checkbox2" type="checkbox" id="checkbox13" /><label for="checkbox13">Checkbox</label></li>
                                                <li><input name="checkbox2" type="checkbox" id="checkbox14" /><label for="checkbox14">Checkbox</label></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="form__row">
                                    <div class="column-5 form__label">
                                        <label>Some radio buttons</label>
                                    </div>
                                    <div class="column-7 column--omega">
                                        <div class="column-6 form__input">
                                            <ul class="form__input-list list-unstyled">
                                                <li><input required="required" name="radio2" type="radio" id="radio13" /><label for="radio13">Radio</label></li>
                                                <li><input name="radio2" type="radio" id="radio14" /><label for="radio14">Radio</label></li>
                                                <li><input name="radio2" type="radio" id="radio10" /><label for="radio10">Radio</label></li>
                                                <li><input name="radio2" type="radio" id="radio11" /><label for="radio11">Radio</label></li>
                                                <li><input name="radio2" type="radio" id="radio12" /><label for="radio12">Radio</label></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <div class="form__actions">
                                <p class="form__required-field"><i>* = Verplicht veld</i></p>
                                <input class="btn btn--beta btn--medium" type="submit" value="verzenden" />
                            </div>
                        </form>
                    </section>

                    <br /><br />

                    <section id="tables">
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
                        <table class="table table--hover">
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
                        <table class="table table--zebra">
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
                        <table class="table table--bordered">
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
                        <table class="table table--zebra table--bordered">
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

                    <section id="pagination">
                        <h1>Pagination</h1>
                        <p>These work with the button classes so you can use those to change color, size is controlled with specific pagination padding.</p>
                        <h2>Default pagination</h2>
                        <div class="btn-container">
                            <a class="btn btn--alpha" href="#">&lsaquo;</a>
                            <a class="btn btn--alpha" href="#">1</a>
                            <a class="btn btn--alpha" href="#">2</a>
                            <a class="btn btn--alpha" href="#">3</a>
                            <a class="btn btn--alpha" href="#">4</a>
                            <a class="btn btn--alpha" href="#">5</a>
                            <a class="btn btn--divider">...</a>
                            <a class="btn btn--alpha" href="#">23</a>
                            <a class="btn btn--alpha" href="#">&rsaquo;</a>
                        </div>
                        <h2>Centered pagination</h2>
                        <div class="btn-container btn-container--center">
                            <a class="btn btn--alpha" href="#">&lsaquo;</a>
                            <a class="btn btn--alpha" href="#">1</a>
                            <a class="btn btn--alpha" href="#">2</a>
                            <a class="btn btn--alpha" href="#">3</a>
                            <a class="btn btn--alpha" href="#">4</a>
                            <a class="btn btn--alpha" href="#">5</a>
                            <a class="btn btn--divider">...</a>
                            <a class="btn btn--alpha" href="#">23</a>
                            <a class="btn btn--alpha" href="#">&rsaquo;</a>
                        </div>
                        <h2>Right pagination</h2>
                        <div class="btn-container btn-container--right">
                            <a class="btn btn--alpha" href="#">&lsaquo;</a>
                            <a class="btn btn--alpha" href="#">1</a>
                            <a class="btn btn--alpha" href="#">2</a>
                            <a class="btn btn--alpha" href="#">3</a>
                            <a class="btn btn--alpha" href="#">4</a>
                            <a class="btn btn--alpha" href="#">5</a>
                            <a class="btn btn--divider">...</a>
                            <a class="btn btn--alpha" href="#">23</a>
                            <a class="btn btn--alpha" href="#">&rsaquo;</a>
                        </div>
                        <h2>Button group pagination</h2>
                        <div class="btn-container">
                            <ul class="btn-group btn-group--inline">
                                <li><a class="btn btn--alpha" href="#">&lsaquo;</a></li>
                                <li><a class="btn btn--alpha" href="#">1</a></li>
                                <li><a class="btn btn--alpha" href="#">2</a></li>
                                <li><a class="btn btn--alpha" href="#">3</a></li>
                                <li><a class="btn btn--alpha" href="#">4</a></li>
                                <li><a class="btn btn--alpha" href="#">5</a></li>
                                <li><a class="btn btn--divider">...</a></li>
                                <li><a class="btn btn--alpha" href="#">23</a></li>
                                <li><a class="btn btn--alpha" href="#">&rsaquo;</a></li>
                            </ul>
                        </div>
                        <h2>Centered button group pagination</h2>
                        <div class="btn-container btn-container--center">
                            <ul class="btn-group btn-group--inline">
                                <li><a class="btn btn--alpha" href="#">&lsaquo;</a></li>
                                <li><a class="btn btn--alpha" href="#">1</a></li>
                                <li><a class="btn btn--alpha" href="#">2</a></li>
                                <li><a class="btn btn--alpha" href="#">3</a></li>
                                <li><a class="btn btn--alpha" href="#">4</a></li>
                                <li><a class="btn btn--alpha" href="#">5</a></li>
                                <li><a class="btn btn--divider">...</a></li>
                                <li><a class="btn btn--alpha" href="#">23</a></li>
                                <li><a class="btn btn--alpha" href="#">&rsaquo;</a></li>
                            </ul>
                        </div>
                        <h2>Right button group pagination</h2>
                        <div class="btn-container btn-container--right">
                            <ul class="btn-group btn-group--inline">
                                <li><a class="btn btn--alpha" href="#">&lsaquo;</a></li>
                                <li><a class="btn btn--alpha" href="#">1</a></li>
                                <li><a class="btn btn--alpha" href="#">2</a></li>
                                <li><a class="btn btn--alpha" href="#">3</a></li>
                                <li><a class="btn btn--alpha" href="#">4</a></li>
                                <li><a class="btn btn--alpha" href="#">5</a></li>
                                <li><a class="btn btn--divider">...</a></li>
                                <li><a class="btn btn--alpha" href="#">23</a></li>
                                <li><a class="btn btn--alpha" href="#">&rsaquo;</a></li>
                            </ul>
                        </div>
                    </section>

                    <br/><br/>

                    <section id="breacrumbs">
                        <h1>Breadcrumbs</h1>
                        <div class="breadcrumbs">
                            <a href="#">Home</a>
                            <a href="#">Lorem</a>
                            <span>Ipsum dolir asmit emet</span>
                        </div>
                    </section>

                    <br/><br/>

                    <section id="tabs">
                        <h1>Tabs</h1>
                        <ul class="tabs">
                            <li><a class="tab tab--active" href="#tab-home">Home</a></li>
                            <li><a class="tab" href="#tab-lorem">Lorem</a></li>
                            <li><a class="tab" href="#tab-ipsum">Ipsum</a></li>
                        </ul>
                        <div class="tab-content">
                            <div class="tab-item tab-item--active" id="tab-home">
                                <div class="grid">
                                    <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                    <div class="column-6 column--omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                </div>
                            </div>
                            <div class="tab-item" id="tab-lorem">
                                <p>Ut pharetra ante id lobortis ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus ac sapien vel purus porta hendrerit. Nulla lacinia ac erat id tempor. Donec felis lorem, hendrerit eu placerat condimentum, faucibus sed metus. Nullam rutrum rutrum odio tempus convallis. Integer tempus lacus libero, non suscipit lacus mattis quis. Nam massa risus, scelerisque at libero non, dapibus lacinia neque. Quisque eu nulla at nunc blandit lobortis. Proin viverra metus tellus, non mollis est elementum ac. Proin elit dolor, gravida vel ipsum sit amet, varius aliquam ipsum</p>
                            </div>
                            <div class="tab-item" id="tab-ipsum">
                                <div class="grid">
                                    <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                    <div class="column-6 column--omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                </div>
                                <div class="grid">
                                    <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                    <div class="column-6 column--omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <br/><br/>

                    <section id="media">
                        <h1>Media</h1>
                        <h2>Left</h2>
                        <div class="media media--left">
                            <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                            <div class="media__beta">
                                <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                            </div>
                        </div>
                        <h2>Right</h2>
                        <div class="media media--right">
                            <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                            <div class="media__beta">
                                <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                            </div>
                        </div>
                        <h3>Nested</h3>
                        <div class="media media--left">
                            <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                            <div class="media__beta">
                                <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                <div class="media media--left">
                                    <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                                    <div class="media__beta">
                                        <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                        <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                    </div>
                                </div>
                                <div class="media media--left">
                                    <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                                    <div class="media__beta">
                                        <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                        <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h2>List</h2>
                        <ul class="media-list">
                            <li class="media media--left">
                                <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                                <div class="media__beta">
                                    <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                    <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                </div>
                            </li>
                            <li class="media media--left">
                                <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                                <div class="media__beta">
                                    <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                    <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                </div>
                            </li>
                        </ul>
                        <h2>Bordered list</h2>
                        <ul class="media-list media-list--bordered">
                            <li class="media media--left">
                                <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                                <div class="media__beta">
                                    <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                    <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                </div>
                            </li>
                            <li class="media media--left">
                                <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                                <div class="media__beta">
                                    <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                    <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                    <div class="media media--left">
                                        <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                                        <div class="media__beta">
                                            <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                            <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                        </div>
                                    </div>
                                    <div class="media media--left">
                                        <div class="media__alpha"><img src="http://placehold.it/400x300/f1f1f1/cfcfcf&text=basos" alt="" /></div>
                                        <div class="media__beta">
                                            <h2><a href="#">You guys realize you live in a sewer, right?</a></h2>
                                            <p>Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </section>

                    <br/><br/>

                    <section id="pricingtables">
                        <h1>Pricing tables</h1>
                        <div class="grid">
                            <div class="column-4">
                                <ul class="pricing-table">
                                    <li class="pricing-table__header">
                                        Basos package
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--alpha">
                                        <div class="pricing-table__price">&euro; 500,-</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__description">Lorem ipsum dolor sit amet.</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__item">50 components</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__item">100 lorems</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__item">5 dolirs</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta price-table__content--action">
                                        <a class="btn btn--beta btn--medium" href="">buy now</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="column-4">
                                <ul class="pricing-table">
                                    <li class="pricing-table__header">
                                        Basos package
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--alpha">
                                        <div class="pricing-table__price">&euro; 600,-</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__description">Lorem ipsum dolor sit amet.</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__item">50 components</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__item">100 lorems</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__item">5 dolirs</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta price-table__content--action">
                                        <a class="btn btn--beta btn--medium" href="">buy now</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="column-4 column--omega">
                                <ul class="pricing-table">
                                    <li class="pricing-table__header">
                                        Basos package
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--alpha">
                                        <div class="pricing-table__price">&euro; 700,-</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__description">Lorem ipsum dolor sit amet.</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__item">50 components</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__item">100 lorems</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta">
                                        <div class="pricing-table__item">5 dolirs</div>
                                    </li>
                                    <li class="pricing-table__content pricing-table__content--beta price-table__content--action">
                                        <a class="btn btn--beta btn--medium" href="">buy now</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <br/><br/>

                    <section id="tooltips">
                        <h1>Tooltips</h1>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--alpha btn--small tooltip" data-tooltip-position="top" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">top</a></li>
                            <li><a class="btn btn--alpha btn--small tooltip" data-tooltip-position="right" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">right</a></li>
                            <li><a class="btn btn--alpha btn--small tooltip" data-tooltip-position="bottom" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">bottom</a></li>
                            <li><a class="btn btn--alpha btn--small tooltip" data-tooltip-position="left" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness.">left</a></li>
                            <li><a class="btn btn--alpha btn--small tooltip" data-tooltip-position="top" title="Kids don't turn rotten just from watching TV. Why not indeed! Yeah, I do that with my stupidness." data-tooltip-trigger="click">click trigger</a></li>
                        </ul>
                    </section>

                    <br/><br/>

                    <section id="dropdowns">
                        <h1>Dropdowns</h1>
                        <ul class="btn-group btn-group--inline">
                            <li>
                                <div class="dropdown">
                                    <a class="btn btn--alpha btn--small">dropdown</a>
                                    <div class="dropdown__content">
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
                                    <a class="btn btn--alpha btn--small">dropdown</a>
                                    <div class="dropdown__content">
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

                    <section id="modals">
                        <h1>Modals</h1>
                        <br />
                        <h2 class="h3">Slip effects</h2>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-1">slip-top</a></li>
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-2">slip-bottom</a></li>
                        </ul>
                        <br />
                        <h2 class="h3">Slide effects</h2>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-3">slide-top</a></li>
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-4">slide-right</a></li>
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-5">slide-bottom</a></li>
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-6">slide-left</a></li>
                        </ul>
                        <br />
                        <h2 class="h3">Flip effects</h2>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-7">flip-horizontal</a></li>
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-8">flip-vertical</a></li>
                        </ul>
                        <br />
                        <h2 class="h3">Scale effects</h2>
                        <ul class="btn-group btn-group--inline">
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-9">fadescale</a></li>
                            <li><a class="btn btn--alpha btn--small modal__trigger" data-modal-id="modal-10">superscaled</a></li>
                        </ul>
                    </section>

                    <br/><br/>

                    <section id="accordion">
                        <h1>Accordion</h1>
                        <div class="accordion">
                            <div class="accordion__group">
                                <a class="accordion__trigger">Accordion item #1</a>
                                <div class="accordion__content accordion-content--show">
                                    <p>You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                    <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                </div>
                            </div>
                            <div class="accordion__group">
                                <a class="accordion__trigger">Accordion item #2</a>
                                <div class="accordion__content">
                                    <p>You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                    <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                    <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                </div>
                            </div>
                            <div class="accordion__group">
                                <a class="accordion__trigger">Accordion item #3</a>
                                <div class="accordion__content">
                                    <p>You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</p>
                                    <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                    <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                    <p>Okay, I like a challenge. Oh, I think we should just stay friends. And from now on you're all named Bender Jr. Why did you bring us here? Humans dating robots is sick. You people wonder why I'm still single? It's 'cause all the fine robot sisters are dating humans! Why would I want to know that?</p>
                                </div>
                            </div>
                            <div class="accordion__group">
                                <a class="accordion__trigger">Accordion item #4</a>
                                <div class="accordion__content">
                                    <h2>With a grid inside</h2>
                                    <div class="grid">
                                        <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                        <div class="column-6 column--omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                    </div>
                                    <div class="grid">
                                        <div class="column-6">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                        <div class="column-6 column--omega">You guys realize you live in a sewer, right? Now Fry, it's been a few years since medical school, so remind me. Disemboweling in your species: fatal or non-fatal? I've been there. My folks were always on me to groom myself and wear underpants. What am I, the pope? Who am I making this out to? No! Don't jump! Bender, we're trying our best.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <br/><br/>

                    <section id="jumpto">
                        <h1>Jump to link</h1>
                        <a class="btn btn--alpha btn--small" href="#grid" data-jumpto>grid</a>
                        <!-- <a class="btn btn--alpha btn--small" href="#buttons" data-jumpto>buttons</a>
                        <a class="btn btn--alpha btn--small" href="#notification" data-jumpto>notifications</a>
                        <a class="btn btn--alpha btn--small" href="#form" data-jumpto>form</a>
                        <a class="btn btn--alpha btn--small" href="#tables" data-jumpto>tables</a>
                        <a class="btn btn--alpha btn--small" href="#pagination" data-jumpto>pagination</a>
                        <a class="btn btn--alpha btn--small" href="#breadcrumbs" data-jumpto>breadcrumbs</a>
                        <a class="btn btn--alpha btn--small" href="#tabs" data-jumpto>tabs</a>
                        <a class="btn btn--alpha btn--small" href="#media" data-jumpto>media</a>
                        <a class="btn btn--alpha btn--small" href="#pricingtables" data-jumpto>pricing tables</a>
                        <a class="btn btn--alpha btn--small" href="#tooltips" data-jumpto>tooltips</a>
                        <a class="btn btn--alpha btn--small" href="#dropdowns" data-jumpto>dropdowns</a>
                        <a class="btn btn--alpha btn--small" href="#modals" data-jumpto>modals</a>
                        <a class="btn btn--alpha btn--small" href="#accordion" data-jumpto>accordion</a> -->
                    </section>

                    <br/><br/>

                    <section id="jumpto">
                        <h1>Progress</h1>
                        <h2>Indeterminate</h2>
                        <progress>
                            <div class="progress-bar">
                                <div class="progress-bar__value"></div>
                            </div>
                        </progress>
                        <div class="progress-bar">
                            <div class="progress-bar__value"></div>
                        </div>
                        <h2>Determinate</h2>
                        <progress max="100" value="80">
                            <div class="progress-bar">
                                <div class="progress-bar__value" style="width: 80%;"></div>
                            </div>
                        </progress>
                        <div class="progress-bar">
                            <div class="progress-bar__value" style="width: 80%;"></div>
                        </div>
                    </section>

                    <br /><br />

                    <section id="jumpto">
                        <h1>Spinners</h1>
                        <p>Note: You can download different icons on <a href="http://www.fontello.com">fontello.com</a>, <a href="http://icomoon.io/app/#/select">icomoon.io</a> or somewhere else.</p>
                        <ul class="btn-group btn-group--block">
                            <li>
                                <div class="spinner spinner--alpha"></div>
                            </li>
                            <li>
                                <div class="spinner spinner--beta"></div>
                            </li>
                            <li>
                                <div class="spinner spinner--gamma"></div>
                            </li>
                        </ul>
                    </section>

                    <br /><br />

                </main>

                <footer class="footer">
                    <ul class="nav-footer list-inline">
                        <li><a class="nav-footer__link nav-footer__link--active" href="#">link</a></li>
                        <li><a class="nav-footer__link" href="#">link</a></li>
                        <li><a class="nav-footer__link" href="#">link</a></li>
                    </ul>
                    <div class="copyright">&copy; copyright 2013</div>
                </footer>
            </div>
        </div>

        <div id="modal-1" class="modal" data-modal-effect="slip-top">
            <div class="modal__content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>
        <div id="modal-2" class="modal" data-modal-effect="slip-bottom">
            <div class="modal__content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>
        <div id="modal-3" class="modal" data-modal-effect="slide-top">
            <div class="modal__content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>
        <div id="modal-4" class="modal" data-modal-effect="slide-right">
            <div class="modal__content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>
        <div id="modal-5" class="modal" data-modal-effect="slide-bottom">
            <div class="modal__content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>
        <div id="modal-6" class="modal" data-modal-effect="slide-left">
            <div class="modal__content">
                <h2>Dit is een titel</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>
        <div id="modal-7" class="modal" data-modal-effect="flip-horizontal">
            <div class="modal__content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>
        <div id="modal-8" class="modal" data-modal-effect="flip-vertical">
            <div class="modal__content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>
        <div id="modal-9" class="modal" data-modal-effect="fadescale">
            <div class="modal__content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>
        <div id="modal-10" class="modal" data-modal-effect="superscale">
            <div class="modal__content">
                <h2>Dit is een titel 2</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis consectetur ligula. Morbi dapibus tellus a ipsum sollicitudin aliquet. Phasellus id est lacus. Pellentesque a elementum velit, a tempor nulla. Mauris mauris lectus, tincidunt et purus rhoncus, eleifend convallis turpis. Nunc ullamcorper bibendum diam, vitae tempus dolor hendrerit iaculis. Phasellus tellus elit, feugiat vel mi et, euismod varius augue. Nulla a porttitor sapien. Donec vestibulum ac nisl sed bibendum. Praesent neque ipsum, commodo eget venenatis vel, tempus sit amet ante. Curabitur vel odio eget urna dapibus imperdiet sit amet eget felis. Vestibulum eros velit, posuere a metus eget, aliquam euismod purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <a href="#" class="btn btn--beta btn--medium" data-modal-close>Akkoord</a>
            </div>
        </div>

        <script src="src/js/main.js"></script>
    </body>
</html>