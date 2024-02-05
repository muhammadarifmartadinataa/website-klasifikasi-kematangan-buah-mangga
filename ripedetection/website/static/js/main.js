Vue.createApp({
    data() {
        return {
            csrf: token,
            isLoading: false,
            image: null,
            previewImage: null,
            level: null,
            progress: 0,
            status: '',
            predictions: []
        }
    },
    delimiters: ['[[', ']]'],
    methods: {
        async onSubmit(){
            if(!this.image){
                Swal.fire({
                    icon: "warning",
                    text: "Pilih gambar dahulu!",
                    timer: 2000,
                    showConfirmButton: false,
                })
            } else {
                this.isLoading = true
                this.progress = 0
                this.status = 'Uploading...'

                await axios.postForm('/detection/', {'image': this.image}, { 
                    headers: { "X-CSRFToken": this.csrf },
                    onUploadProgress: (progressEvent) => {
                        this.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    }
                })
                .then((result) => {
                    this.status = 'Identification...'
                    setTimeout(() => {
                        this.isLoading = false
                        if(result.data.status){
                            this.level = result.data.results.level
                            this.predictions = result.data.results.predictions
                        } else {
                            Swal.fire({
                                icon: "warning",
                                text: result.data.message,
                                timer: 2000,
                                showConfirmButton: false,
                            })
                        }
                    }, 5000);
                })
            }
        },
        fileHandler(e){
            this.previewImage = null
            this.image = null
            this.level = null
            this.progress = 0
            this.predictions.length = 0

            const file = e.target.files[0]
            if(file) {
                this.image = file
                this.previewImage = URL.createObjectURL(file)
            }
        },
        startLoading() {
            this.isLoading = true;
            this.progress = 0;

            // Mulai loading progressif di sini
            const interval = setInterval(() => {
                this.progress += 10;
                if (this.progress >= 100) {
                    clearInterval(interval);
                    this.isLoading = false;
                }
            }, 500);
        }
    },
    computed: {
        getResult(){
            if(this.level){
                result = {'level': null, 'description': null}

                if(this.level == 'matang'){
                    result['level'] = "matang"
                    result['description'] = "Mangga yang sudah matang memiliki kulit yang sepenuhnya berwarna oranye atau merah, tergantung pada varietasnya. Tekstur dagingnya menjadi lebih lembut dan juicy. Rasanya cenderung lebih manis, dan aroma mangga yang matang sangat kuat. Saat sentuhan, mangga matang akan terasa agak lembek. Dalam kondisi ini, buah mangga siap untuk dikonsumsi dan memberikan pengalaman rasa yang penuh kenikmatan."
                } else if(this.level == 'mentah'){
                    result['level'] = "mentah"
                    result['description'] = "Mangga dalam keadaan mentah biasanya memiliki ciri-ciri kulit yang masih hijau, keras, dan seringkali bersisik. Dalam kondisi ini, daging mangga cenderung keras dan asem. Warna kulitnya mungkin lebih gelap di bagian tertentu, tetapi secara keseluruhan masih dominan berwarna hijau. Biasanya, saat mangga masih mentah, rasanya lebih asam dan kurang manis."
                } else {
                    result['level'] = "setengah matang"
                    result['description'] = "Mangga setengah matang ditandai dengan perubahan warna kulit yang mulai memerah atau oranye. Tekstur dagingnya menjadi lebih lembut, tetapi masih sedikit krispi. Pada tahap ini, rasanya mulai mencampur antara keasaman dan manis. Mangga setengah matang sering memiliki aroma yang lebih kuat dan terasa lebih segar dibanding yang masih mentah."
                }

                return result
            } else {
                return "Ada yang error"
            }
        }
    }
}).mount('#app');