// SPDX-License-Identifier: GPL-2.0-or-later
/*
 * src/scanner.c
 *
 * A simple SCANOSS client in C for direct file scanning
 *
 * Copyright (C) 2022, SCANOSS
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#define _GNU_SOURCE
#include <ctype.h>
#include <openssl/md5.h>
#include <openssl/ssl.h>
#include <dirent.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <curl/curl.h>
#include <sys/time.h>
#include <math.h>
#include "scanner.h"
#include "blacklist_ext.h"
#include "winnowing.h"
#include "log.h"
#include "format_utils.h"
/*SCANNER PRIVATE PROPERTIES*/


#define MAX_FILES_CHUNK (1<<31)

#define DEFAULT_WFP_SCAN_FILE_NAME "scan.wfp"
#define DEFAULT_RESULT_NAME "scanner_output.txt"

const char EXCLUDED_DIR[] = " .git, .svn, .eggs, __pycache__, node_modules,";
const char EXCLUDED_EXTENSIONS[] = " .1, .2, .3, .4, .5, .6, .7, .8, .9, .ac, .adoc, .am,"
	                                " .asciidoc, .bmp, .build, .cfg, .chm, .class, .cmake, .cnf,"
	                                " .conf, .config, .contributors, .copying, .crt, .csproj, .css,"
	                                " .csv, .cvsignore, .dat, .data, .doc, .ds_store, .dtd, .dts,"
	                                " .dtsi, .dump, .eot, .eps, .geojson, .gdoc, .gif, .gitignore,"
	                                " .glif, .gmo, .gradle, .guess, .hex, .htm, .html, .ico, .in,"
                                    " .inc, .info, .ini, .ipynb, .jpeg, .jpg, .json, .jsonld,"
                                    " .log, .m4, .map, .markdown, .md, .md5, .meta, .mk, .mxml,"
                                    " .o, .otf, .out, .pbtxt, .pdf, .pem, .phtml, .plist, .png,"
                                    " .po, .ppt, .prefs, .properties, .pyc, .qdoc, .result, .rgb,"
                                    " .rst, .scss, .sha, .sha1, .sha2, .sha256, .sln, .spec, .sql,"
                                    " .sub, .svg, .svn-base, .tab, .template, .test, .tex, .tiff,"
                                    " .toml, .ttf, .txt, .utf-8, .vim, .wav, .whl, .woff, .xht,"
                                    " .xhtml, .xls, .xml, .xpm, .xsd, .xul, .yaml, .yml,";


static int curl_request(int api_req, char* endpoint, char* data,scanner_object_t *s);
static int curl_request_v2(int api_req, char* endpoint, char* data,scanner_object_t *s);

/* Returns a hexadecimal representation of the first "len" bytes in "bin" */
static char *bin_to_hex(uint8_t *bin, uint32_t len)
{
    char digits[] = "0123456789abcdef";
    char *out = malloc(2 * len + 1);
    uint32_t ptr = 0;

    for (uint32_t i = 0; i < len; i++)
    {
        out[ptr++] = digits[(bin[i] & 0xF0) >> 4];
        out[ptr++] = digits[bin[i] & 0x0F];
    }

    out[ptr] = 0;
    return out;
}

static char *read_file(char *path, long *length)
{
    /* Read file into memory */
    FILE *fp = fopen(path, "rb");
    fseek(fp, 0, SEEK_END);
    *length = ftell(fp);
    char *src = calloc(*length + 2, 1);
    fseek(fp, 0, SEEK_SET);
    fread(src, 1, *length, fp);
    fclose(fp);
    return src;
}

static long millis()
{
    struct timespec _t;
    clock_gettime(CLOCK_REALTIME, &_t);
    return _t.tv_sec*1000 + lround(_t.tv_nsec/1.0e6);
}

static bool scanner_is_dir(char *path)
{
    struct stat pstat;
    if (!stat(path, &pstat))
        if (S_ISDIR(pstat.st_mode))
            return true;
    return false;
}

static bool scanner_is_file(char *path)
{
    struct stat pstat;
    if (!stat(path, &pstat))
        if (S_ISREG(pstat.st_mode))
            return true;
    return false;
}


static void scanner_write_none_result(scanner_object_t *s, char * path)
{
    fprintf(s->output, "\"%s\":[{\n\"id\":\"none\"\n}]\n,\n", path);
}

static uint key_count(char * buffer, const char * key)
{
    char *found =  strstr(buffer, key);;
    uint count = 0;
    while(found)
    {
        found += strlen(key);
        found = strstr(found,key);
        count++;
    }
    return count;
}

static uint wfp_files_count(scanner_object_t *s)
{
    const char file_key[] = "file=";
    long buffer_size = 0; //size of wfp file
    char *wfp_buffer = read_file(s->wfp_path, &buffer_size);
    uint count =key_count(wfp_buffer,file_key);
    free(wfp_buffer);
    s->status.wfp_files = count;
    return count;
}

/* Scan a file */
static bool scanner_file_proc(scanner_object_t *s, char *path)
{
    bool state = true;
    char *wfp_buffer;
    char *ext = strrchr(path, '.');
    if (!ext)
        return state;

    char f_extension[strlen(ext) + 3];

    /*File extension filter*/
    sprintf(f_extension, " %s,", ext);

    if (strstr(EXCLUDED_EXTENSIONS, f_extension))
    {
        log_trace("Excluded extension: %s", ext);
        scanner_write_none_result(s, path); //add none id to ignored files
        return true; //avoid filtered extensions
    } 
    
    s->status.state = SCANNER_STATE_WFP_CALC; //update scanner state
    
    //If we have a wfp file, add the content to the main wfp file.
    if (!strcmp(ext, ".wfp"))
    {
        log_debug("is a wfp file: %s", path);
        long len = 0;
        wfp_buffer = read_file(path, &len);
        
        //ensure line end character
        wfp_buffer[len] = '\n';
        s->status.wfp_files += key_count(wfp_buffer,"file=") - 1; //correct the total files number
    }
    else
    {
         wfp_buffer = calloc(MAX_FILE_SIZE, 1);
        *wfp_buffer = 0;
        scanner_wfp_capture(path,NULL, wfp_buffer);
    }
    
    if (*wfp_buffer)
    {
        FILE *wfp_f = fopen(s->wfp_path, "a+");
        fprintf(wfp_f, "%s", wfp_buffer);
        fclose(wfp_f);
        state = false;
        s->status.wfp_files++; //update scanner proc. files
    }
    else
    {
        scanner_write_none_result(s, path); //add none id to ignored files
        log_trace("No wfp: %s", path);
    }

    free(wfp_buffer);

    if (s->callback && s->status.wfp_files % 100 == 0)
        s->callback(&s->status,SCANNER_EVT_WFP_CALC_IT);
    
    return state;
}

static bool get_last_component(char * buffer, char * component)
{
    bool state = true;

    char * last = buffer;
    const char key[] = "\"component\":";

    while (last < buffer + strlen(buffer) && last != NULL)
    {
        last = strstr(last, key);
        
        if (last)
        {
            char * comp_first_letter = strchr(last,':') + 2;
            
            if (*comp_first_letter != ' ')
            {
                char * comp_last_letter = strchr(last,',');
                memset(component,0,MAX_COMPONENT_SIZE);
                strncpy(component,comp_first_letter+1,comp_last_letter-comp_first_letter-2);
                state = false;
            }

            last += strlen(key);   
        }

    }
    return state;
}

void json_correct(char * target)
{
    size_t file_length = strlen(target);
     
    char buffer[file_length];
    char *insert_point = &buffer[0];
    const char *tmp = target;

    char * needle;
    char * replacement;

    asprintf(&needle,"}\n\r\n{");
    asprintf(&replacement,"\n\r,\r\n");

    size_t needle_len = strlen(needle);
    size_t repl_len = strlen(replacement);   

    while (1) {
        const char *p = strstr(tmp, needle);

        // walked past last occurrence of needle; copy remaining part
        if (p == NULL) 
        {
            strcpy(insert_point, tmp);
            break;
        }

        // copy part before needle
        memcpy(insert_point, tmp, p - tmp);
        insert_point += p - tmp;

        // copy replacement string
        memcpy(insert_point, replacement, repl_len);
        insert_point += repl_len;

        // adjust pointers, move on
        tmp = p + needle_len;
    }
    memset(target,0,file_length);
    strcpy(target,buffer);
    free(needle);
    free(replacement);
}

static bool scan_request_by_chunks(scanner_object_t *s)
{
#define START_FIND_COMP_FROM_END 36864

    const char file_key[] = "file=";
    bool state = true;
    
    int files_count = 0;
    
    long buffer_size = 0; //size of wfp file
    char *wfp_buffer = read_file(s->wfp_path, &buffer_size);
    wfp_buffer[buffer_size] = 0;
    
    char * last_file = wfp_buffer;
    char * prev_file = wfp_buffer;
    char * last_chunk = wfp_buffer;
    
    char post_response_buffer[START_FIND_COMP_FROM_END+1];
    int post_response_pos = 0;
    long chunk_start_time = 0;
    fpos_t file_pos;
    
    asprintf(&s->curl_temp_path,"%s.tmp",s->output_path);

    s->status.state = SCANNER_STATE_ANALIZING;
    log_debug("ID: %s - Scanning, it could take some time, please be patient",s->status.id);
    //walk over wfp buffer search for file key
    s->status.total_response_time = millis();
    while(last_file - wfp_buffer < buffer_size)
    {      
        chunk_start_time = millis();
        last_file = strstr(last_file,file_key);

        if (last_file - last_chunk > s->files_chunk_size || (last_file == NULL))
        {
            if (last_file  == NULL)
                prev_file = &wfp_buffer[buffer_size];
            
            //exact a new chunk from wfp file
            uint size = prev_file - last_chunk;
            if (size == 0)
            {
                size = s->files_chunk_size -1;
                prev_file = last_file;
            }
                 
            char *chunk_buffer = calloc(size + 1, 1);
            strncpy(chunk_buffer,last_chunk,size);
            
            s->status.scanned_files = files_count; //update proc. files
            last_chunk = prev_file;
            last_file = prev_file;
            //define the component context, find the last component in the output file.
            post_response_pos = ftell(s->output);
            
            memset(post_response_buffer,0,sizeof(post_response_buffer));
            
            if (post_response_pos < START_FIND_COMP_FROM_END)
            {
                fseek(s->output,0L,SEEK_SET);
            }
            else
            {
                fseek(s->output,-1*START_FIND_COMP_FROM_END,SEEK_END);
            }
            
            //go back in the output file and find the last component
            fread(post_response_buffer,1,START_FIND_COMP_FROM_END,s->output);
            get_last_component(post_response_buffer,s->status.component_last);
            
            log_debug("Last found component: %s", s->status.component_last);
            
            fseek(s->output,0L,SEEK_END);
        
            //get the result from the last chunk - It will be append to the output file
            fgetpos(s->output, &file_pos);
            curl_request(API_REQ_POST,"scan/direct",chunk_buffer,s);
            
            /*read curl response and correct the json */
            long chunk_resp_size;
            char * chunk_resp = read_file(s->curl_temp_path, &chunk_resp_size);
            char * last_bracket = strrchr(chunk_resp,'}');
            *last_bracket = ','; //replace } by ,
            fwrite(chunk_resp+1, 1, chunk_resp_size - 1, s->output); // avoid first {
            free(chunk_resp);
            
            free(chunk_buffer);
            state = false;
            s->status.last_chunk_response_time = millis() - chunk_start_time; 
            log_debug("ID: %s - Chunk proc. end, %u processed files in %ld ms", s->status.id, s->status.scanned_files,millis() - s->status.total_response_time);
            sprintf(s->status.message, "CHUNK_PROC_%lu_ms", s->status.last_chunk_response_time);
            if (s->callback)
            {
                s->callback(&s->status,SCANNER_EVT_CHUNK_PROC);
            }

        }
        else
        {
            files_count++;
        }
        prev_file = last_file;
        last_file += strlen(file_key);
    }
    s->status.total_response_time = millis() - s->status.total_response_time;
    
    fseek(s->output,-4L,SEEK_END);
    fprintf(s->output,"\n}");
    
    if (s->callback)
    {
        s->callback(&s->status,SCANNER_EVT_CHUNK_PROC_END);
    }
    free(wfp_buffer);
    remove(s->curl_temp_path); //delete tmp file
    free(s->curl_temp_path);  

    s->status.state = SCANNER_STATE_OK;
    return state;

}

/* Scan all files from a Directory*/
static bool scanner_dir_proc(scanner_object_t *s, char *path)
{

    bool state = true; //true if were a error

    DIR *d = opendir(path);
    if (d == NULL)
        return false;
    struct dirent *entry; // for the directory entries

    //remove "./" from path
    if (path[0] == '.' && path[1] == '/')
    {
        path+=2;
    }

    while ((entry = readdir(d)) != NULL)
    {
        char temp[strlen(path) + strlen(entry->d_name) + 2];
        
        sprintf(temp, "%s/%s", path, entry->d_name);

        if (entry->d_type == DT_DIR)
        {

            if (!strcmp(entry->d_name, ".") || !strcmp(entry->d_name, ".."))
                continue;

            /*Directory filter */
            char f_dir[strlen(entry->d_name) + 3];
            sprintf(f_dir, " %s,", entry->d_name);
            if (strstr(EXCLUDED_DIR, f_dir))
            {
                log_trace("Excluded Directory: %s", entry->d_name);
                continue;
            }
            scanner_dir_proc(s, temp); //If its a valid directory, then process it
        }
        else if (scanner_is_file(temp))
        {
            if (!scanner_file_proc(s ,temp))
            {
                log_trace("Scan: %s", temp);
            }
            state = false;
        }
    }

    closedir(d);
    return state;
}


static int curl_request(int api_req,char * endpoint, char* data, scanner_object_t *s)
{
    char *m_host;
    char *user_version;
    char *user_session;
    char *flags;
    curl_mime *mime = NULL;

    long m_port = strtol(s->API_port, NULL, 10);
    
    asprintf(&user_session, "X-session: %s", s->API_session);
    asprintf(&user_version, "User-Agent: "SCANOSS_CLIENT_NAME"/"VERSION);
    asprintf(&flags,"%u",s->flags);

    s->curl_temp = fopen(s->curl_temp_path, "w+");
    
    if (api_req == API_REQ_POST)
        asprintf(&m_host, "%s/%s", s->API_host,endpoint);

    else
        asprintf(&m_host,"%s/%s/%s",s->API_host,endpoint,data);
        
    CURL *curl;
    CURLcode res;
    /* In windows, this will init the winsock stuff */
    res = curl_global_init(CURL_GLOBAL_DEFAULT);
    /* Check for errors */
    if (res != CURLE_OK)
    {
        log_fatal("curl_global_init() failed: %s\n",
                curl_easy_strerror(res));
        return 1;
    }

    /* get a curl handle */
    curl = curl_easy_init();
    if (curl)
    {
        /* First set the URL that is about to receive our POST. */
        curl_easy_setopt(curl, CURLOPT_URL, m_host);
        curl_easy_setopt(curl, CURLOPT_PORT, m_port);
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L); //curl ignore certificates
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L); //curl ignore certificates
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, s->curl_temp);
     
        if (log_level_is_enabled(LOG_TRACE))
            curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);

        curl_easy_setopt(curl, CURLOPT_DEFAULT_PROTOCOL, "https");

        struct curl_slist *chunk = NULL;
        chunk = curl_slist_append(chunk, "Connection: close");
        chunk = curl_slist_append(chunk, user_version);
        chunk = curl_slist_append(chunk, user_session);
        chunk = curl_slist_append(chunk, "Expect:");
        chunk = curl_slist_append(chunk, "Accept: */*");

        res = curl_easy_setopt(curl, CURLOPT_HTTPHEADER, chunk);

        if (api_req == API_REQ_POST)
        {
            curl_mimepart *part;
            mime = curl_mime_init(curl);
            
            part = curl_mime_addpart(mime);
            curl_mime_name(part, "format");
            //curl_mime_data(part, s->format, CURL_ZERO_TERMINATED);
            //we are forcing to plain format because spdx and cyclonedx are processing local.
            curl_mime_data(part, "plain", CURL_ZERO_TERMINATED);

            part = curl_mime_addpart(mime);
            curl_mime_name(part, "flags");
            curl_mime_data(part, flags, CURL_ZERO_TERMINATED);

            part = curl_mime_addpart(mime);
            curl_mime_name(part, "context");
            curl_mime_data(part, s->status.component_last, CURL_ZERO_TERMINATED);
            
            part = curl_mime_addpart(mime);
            curl_mime_name(part, "file");
            curl_mime_filename(part, "scan.wfp");
            curl_mime_type(part,"application/octet-stream");
            curl_mime_data(part, data, CURL_ZERO_TERMINATED);

            curl_easy_setopt(curl, CURLOPT_MIMEPOST, mime);
        }
    
        /* Perform the request, res will get the return code */
        res = curl_easy_perform(curl);
        
        /* Check for errors */
        if (res != CURLE_OK)
        {
            log_error("curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
            if (s->callback)
            {
                s->callback(&s->status,SCANNER_EVT_ERROR_CURL);
            }
        }
        
        fclose(s->curl_temp);
        /* always cleanup */
        curl_easy_cleanup(curl);
        curl_slist_free_all(chunk);
    }

    curl_global_cleanup();
    free(flags);
    free(m_host);
    free(user_session);
    free(user_version);
    if (API_REQ_POST)
        curl_mime_free(mime);

    return 0;

}
bool print_format(scanner_object_t * s)
{
    if (!strcmp(s->format, SCANNER_FORMAT_PLAIN))
        return false;

    fprintf(stderr, "\nPrinting the selected format: %s", s->format);
    if(scan_parse_v2(s->output_path))
    {
        log_error("There was a error parsing the json file, please check the output: %s", s->output_path);
        return true;
    }
    
    //rewrite output path with the selected format
    s->output = fopen(s->output_path, "w+");
    print_matches(s->output, s->format);
    fclose(s->output);
    return false;
}

/********* PUBLIC FUNTIONS DEFINITION ************/

void scanner_set_format(scanner_object_t *s, char *form)
{
    if (!form)
        return;
        
    if (strstr(form, "plain") || strstr(form, "spdx") || strstr(form, "cyclonedx"))
    {
        strncpy(s->format, form, sizeof(s->format));
    }
    else
        log_debug("%s is not a valid output format, using plain\n", form);
  
}

void scanner_set_host(scanner_object_t *s, char *host)
{
    if (!host || strcmp(host," ") == 0)
        return;

    memset(s->API_host, '\0', sizeof(s->API_host));
    strncpy(s->API_host, host, sizeof(s->API_host));
    log_debug("Host set: %s", s->API_host);
}

void scanner_set_port(scanner_object_t *s, char *port)
{
    if (!port || strcmp(port," ") == 0)
        return;

    memset(s->API_port, '\0', sizeof(s->API_port));
    strncpy(s->API_port, port, sizeof(s->API_port));
    log_debug("Port set: %s", s->API_port);
}

void scanner_set_session(scanner_object_t *s, char *session)
{
    if (!session || strcmp(session," ") == 0)
        return;

    memset(s->API_session, '\0', sizeof(s->API_session));
    strncpy(s->API_session, session, sizeof(s->API_session));
    log_debug("Session set: %s", s->API_session);
}

void scanner_set_log_level(int level)
{
    log_set_level(level);
}

void scanner_set_log_file(char *log)
{
    log_set_file(log);
}

void scanner_set_output(scanner_object_t * e, char * f)
{
    if (!f)
    {
       asprintf(&e->output_path,"%s", DEFAULT_RESULT_NAME); 
    }
    else
        e->output_path = f;

    e->output = fopen(e->output_path, "w+");
    if (!e->output)
        log_fatal("Failed to open the output file. Check the if the permmisions are right and if the directory exist");
    
    //open json file
    fprintf(e->output,"{\n");    
    log_debug("ID: %s -File open: %s", e->status.id, e->output_path);
}

void scanner_wfp_capture(char *path, char **md5, char *wfp_buffer)
{
    char *hex_md5 = NULL;
    long length = 0;
    char *src = read_file(path, &length);
    //no external memory parameter, normal execution
    if (md5 == NULL)
    {
        if (length > MIN_FILE_SIZE && !unwanted_header(src))
        {
        /* Calculate MD5 */
            uint8_t bin_md5[16] = "\0";
            MD5((uint8_t *)src, length, bin_md5);
            hex_md5 = bin_to_hex(bin_md5, 16);
        }
    }
    //external reference, but null. Reserve memory and calc md5.
    else if (*md5 == NULL)
    {
        /* Calculate MD5 */
        uint8_t bin_md5[16] = "\0";
        MD5((uint8_t *)src, length, bin_md5);
        hex_md5 = bin_to_hex(bin_md5, 16);
        *md5 = strdup(hex_md5);
    }
    //external md5, use it
    else
    {
        hex_md5 = *md5;
    }

    /* Skip if file is under threshold or if content is not wanted*/
    if (length < MIN_FILE_SIZE || unwanted_header(src))
    {
       free(src);
       return;
    }

    /* Save file information to buffer */
    sprintf(wfp_buffer + strlen(wfp_buffer), "file=%s,%lu,%s\n", hex_md5, length, path);
    free(hex_md5);

    /* If it is not binary (chr(0) found), calculate snippet wfps */
    if (strlen(src) == length && length < MAX_FILE_SIZE)
    {
        /* Capture hashes (Winnowing) */
        uint32_t *hashes = malloc(MAX_FILE_SIZE);
        uint32_t *lines = malloc(MAX_FILE_SIZE);
        uint32_t last_line = 0;

        /* Calculate hashes */
        uint32_t size = winnowing(src, hashes, lines, MAX_FILE_SIZE);

        /* Write hashes to buffer */
        for (int i = 0; i < size; i++)
        {
            if (last_line != lines[i])
            {
                if (last_line != 0)
                    strcat(wfp_buffer, "\n");
                sprintf(wfp_buffer + strlen(wfp_buffer), "%d=%08x", lines[i], hashes[i]);
                last_line = lines[i];
            }
            else
                sprintf(wfp_buffer + strlen(wfp_buffer), ",%08x", hashes[i]);
        }
        strcat(wfp_buffer, "\n");
        free(hashes);
        free(lines);           
    }
    free(src);
}

int scanner_recursive_scan(scanner_object_t * scanner, bool wfp_only)
{  
    if (!scanner)
    {
        log_fatal("Scanner object need to proceed");
    }
    scanner->status.state = SCANNER_STATE_INIT;
    scanner->status.wfp_files = 0;
    scanner->status.scanned_files = 0;
    scanner->status.wfp_total_time = millis();    
    scanner->status.last_chunk_response_time = 0;
    scanner->status.total_response_time = 0;
    asprintf(&scanner->wfp_path,"%s.wfp",scanner->output_path);
    strcpy(scanner->status.message, "WFP_CALC_START\0");
    log_debug("ID: %s - Scan start - WFP Calculation", scanner->status.id);
    
    if (scanner->callback)
    {
        scanner->callback(&scanner->status,SCANNER_EVT_START);
    } 
    //check if exist the output file
    if (!scanner->output)
        scanner_set_output(scanner, NULL);
      
    /*create blank wfp file*/
    FILE *wfp_f = fopen(scanner->wfp_path, "w+");
    fclose(wfp_f);

    if (scanner_is_file(scanner->scan_path))
    {
        scanner_file_proc(scanner, scanner->scan_path);
    }
    else if (scanner_is_dir(scanner->scan_path))
    {
        int path_len = strlen(scanner->scan_path);
        if (path_len > 1 && scanner->scan_path[path_len - 1] == '/') //remove extra '/'
            scanner->scan_path[path_len - 1] = '\0';
        
        scanner_dir_proc(scanner, scanner->scan_path);
    }
    else
    {
        scanner->status.state = SCANNER_STATE_ERROR;
        log_error("\"%s\" is not a file\n", scanner->scan_path);
        if (scanner->callback)
        {
            scanner->callback(&scanner->status,SCANNER_EVT_ERROR);
        }
    }
    scanner->status.wfp_total_time = millis() - scanner->status.wfp_total_time;
    log_debug("ID: %s - WFP calculation end, %u processed files in %ld ms", scanner->status.id, scanner->status.wfp_files, scanner->status.wfp_total_time);
    if (scanner->callback)
    {
        scanner->callback(&scanner->status,SCANNER_EVT_WFP_CALC_END);
    }

    strcpy(scanner->status.message, "WFP_CALC_END\0"); 
    
    if (wfp_only)
        return scanner->status.state;

    scan_request_by_chunks(scanner);
    free(scanner->wfp_path);  

    if (scanner->output)
    {
        fclose(scanner->output);
    }
    //print the selected format or do nothing if it is plain.
    print_format(scanner);

    if (scanner->callback)
    {
        scanner->callback(&scanner->status,SCANNER_EVT_END);
    }
    strcpy(scanner->status.message, "FINISHED\0");

    return scanner->status.state;
}

int scanner_wfp_scan(scanner_object_t * scanner)
{
    if (!scanner)
    {
        log_fatal("Scanner object need to proceed");
    }
    scanner->status.state = SCANNER_STATE_INIT;
    scanner->status.wfp_files = 0;
    scanner->status.scanned_files = 0;
    scanner->status.wfp_total_time = millis();    
    scanner->status.last_chunk_response_time = 0;
    scanner->status.total_response_time = 0;

    if(!scanner_is_file(scanner->scan_path))
    {
        log_debug("wfp_scan only works with wfp files");
        return SCANNER_STATE_ERROR;
    }

    scanner->wfp_path = scanner->scan_path;
    
    if (wfp_files_count(scanner) == 0)
        return SCANNER_STATE_ERROR;

    strcpy(scanner->status.message, "WFP_PROC_START\0");
    log_debug("ID: %s - Scan start - Scanning WFP file by chunks", scanner->status.id);
    if (scanner->callback)
    {
        scanner->callback(&scanner->status,SCANNER_EVT_CHUNK_PROC);
    }

     scan_request_by_chunks(scanner);

    if (scanner->output)
        fclose(scanner->output);

    if (scanner->callback)
    {
        scanner->callback(&scanner->status,SCANNER_EVT_END);
    }
    strcpy(scanner->status.message, "FINISHED\0");

    return scanner->status.state; 
    
}


int scanner_get_file_contents(scanner_object_t *scanner, char * hash)
{ 
    scanner->curl_temp_path = scanner->output_path;
    int err_code = curl_request(API_REQ_GET,"file_contents",hash,scanner);

    return err_code;
}

int scanner_get_license_obligations(scanner_object_t *scanner, char * license_name)
{ 
    scanner->curl_temp_path = scanner->output_path;
    int err_code = curl_request(API_REQ_GET,"license/obligations",license_name,scanner);

    return err_code;
}

bool scanner_get_attribution(scanner_object_t *scanner, char * path)
{
    long len;
    char * data = read_file(path,&len);
    
    scanner->curl_temp_path = scanner->output_path;
    int state = curl_request(API_REQ_POST,"sbom/attribution", data, scanner);

    free(data);
    return state;   
}


int scanner_print_output(scanner_object_t *scanner)
{
    bool state = true;
    
    if (!scanner->output_path)
        return 1;

    FILE * output = fopen(scanner->output_path, "r");
    char c;
    
    if (output) 
    {
        while ((c = getc(output)) != EOF)
            putchar(c);
    
        fclose(output);
        state = false;
    }
    
    free(scanner->output_path);
    return state;   
}
scanner_object_t * scanner_create(char * id, char * host, char * port, char * session, char * format, char * path, char * file, scanner_flags_t flags, scanner_evt_handler callback)
{
    scanner_object_t *scanner = calloc(1, sizeof(scanner_object_t));
    scanner_object_t init = __SCANNER_OBJECT_INIT(path,file);
    init.callback = callback;
    strncpy(init.status.id, id, MAX_ID_LEN);

     //copy default config
    memcpy(scanner,&init,sizeof(scanner_object_t));

    scanner_set_host(scanner, host);
    scanner_set_port(scanner, port);
    scanner_set_session(scanner, session);

    if (flags > 0)
        scanner->flags = flags;

    scanner_set_format(scanner, format);
    scanner_set_output(scanner, file);

    
    strcpy(scanner->status.message, "SCANNER_CREATED\0");
    return scanner;
}


void scanner_object_free(scanner_object_t * scanner)
{
    free(scanner);
}